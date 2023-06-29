/* exported ForwardBackGestureExtension */
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { ExtSettings } = Me.imports.constants;
const { ArrowIconAnimation } = Me.imports.src.animations.arrow;
const { createSwipeTracker } = Me.imports.src.swipeTracker;
const { getVirtualKeyboard } = Me.imports.src.utils.keyboard;
const { ForwardBackKeyBinds } = Me.imports.common.settings;
const Main = imports.ui.main;

// declare enum
var AnimationState;
(function (AnimationState) {
	AnimationState[AnimationState['WAITING'] = 0] = 'WAITING';
	AnimationState[AnimationState['DEFAULT'] = 0] = 'DEFAULT';
	AnimationState[AnimationState['LEFT'] = -1] = 'LEFT';
	AnimationState[AnimationState['RIGHT'] = 1] = 'RIGHT';
})(AnimationState || (AnimationState = {}));

// declare enum
var SwipeGestureDirection;
(function (SwipeGestureDirection) {
	SwipeGestureDirection[SwipeGestureDirection['LeftToRight'] = 1] = 'LeftToRight';
	SwipeGestureDirection[SwipeGestureDirection['RightToLeft'] = 2] = 'RightToLeft';
})(SwipeGestureDirection || (SwipeGestureDirection = {}));

const SnapPointThreshold = 0.1;

var ForwardBackGestureExtension = class ForwardBackGestureExtension {
	constructor(appForwardBackKeyBinds) {
		this._animationState = AnimationState.WAITING;
		this._appForwardBackKeyBinds = appForwardBackKeyBinds;
		this._windowTracker = Shell.WindowTracker.get_default();
		this._keyboard = getVirtualKeyboard();
		this._swipeTracker = createSwipeTracker(global.stage, ExtSettings.DEFAULT_SESSION_WORKSPACE_GESTURE ? [4] : [3], Shell.ActionMode.NORMAL, Clutter.Orientation.HORIZONTAL, false, 1, { allowTouch: false });
		this._connectHandlers = [
			this._swipeTracker.connect('begin', this._gestureBegin.bind(this)),
			this._swipeTracker.connect('update', this._gestureUpdate.bind(this)),
			this._swipeTracker.connect('end', this._gestureEnd.bind(this)),
		];

		this._arrowIconAnimation = new ArrowIconAnimation();
		this._arrowIconAnimation.hide();
		Main.layoutManager.uiGroup.add_child(this._arrowIconAnimation);
	}

	destroy() {
		this._connectHandlers.forEach(handle => this._swipeTracker.disconnect(handle));
		this._connectHandlers = [];
		this._swipeTracker.destroy();
		this._arrowIconAnimation.destroy();
	}

	_gestureBegin(tracker) {
		this._focusWindow = global.display.get_focus_window();
		if (!this._focusWindow)
			return;
		this._animationState = AnimationState.WAITING;
		tracker.confirmSwipe(global.screen_width, [AnimationState.LEFT, AnimationState.DEFAULT, AnimationState.RIGHT], AnimationState.DEFAULT, AnimationState.DEFAULT);
	}

	_gestureUpdate(_tracker, progress) {
		switch (this._animationState) {
			case AnimationState.WAITING:
				if (Math.abs(progress - AnimationState.DEFAULT) < SnapPointThreshold)
					return;
				this._showArrow(progress);
				break;
			case AnimationState.RIGHT:
				progress = (progress - SnapPointThreshold) / (AnimationState.RIGHT - SnapPointThreshold);
				this._arrowIconAnimation.gestureUpdate(Math.clamp(progress, 0, 1));
				break;
			case AnimationState.LEFT:
				progress = (progress + SnapPointThreshold) / (AnimationState.LEFT + SnapPointThreshold);
				this._arrowIconAnimation.gestureUpdate(Math.clamp(progress, 0, 1));
		}
	}

	_gestureEnd(_tracker, duration, progress) {
		if (this._animationState === AnimationState.WAITING) {
			if (progress === AnimationState.DEFAULT)
				return;
			this._showArrow(progress);
		}

		switch (this._animationState) {
			case AnimationState.RIGHT:
				progress = (progress - SnapPointThreshold) / (AnimationState.RIGHT - SnapPointThreshold);
				progress = Math.clamp(progress, 0, 1);
				this._arrowIconAnimation.gestureEnd(duration, progress, () => {
					if (progress !== 0) {
						// bring left page to right
						const keys = this._getClutterKeyForFocusedApp(SwipeGestureDirection.LeftToRight);
						this._keyboard.sendKeys(keys);
					}
				});

				break;
			case AnimationState.LEFT:
				progress = (progress + SnapPointThreshold) / (AnimationState.LEFT + SnapPointThreshold);
				progress = Math.clamp(progress, 0, 1);
				this._arrowIconAnimation.gestureEnd(duration, progress, () => {
					if (progress !== 0) {
						// bring right page to left
						const keys = this._getClutterKeyForFocusedApp(SwipeGestureDirection.RightToLeft);
						this._keyboard.sendKeys(keys);
					}
				});
		}
	}

	_showArrow(progress) {
		const [height, width] = [this._arrowIconAnimation.height, this._arrowIconAnimation.width];
		const workArea = this._getWorkArea();
		if (progress > AnimationState.DEFAULT) {
			this._animationState = AnimationState.RIGHT;
			this._arrowIconAnimation.gestureBegin('arrow1-left-symbolic.svg', true);
			this._arrowIconAnimation.set_position(workArea.x + width, workArea.y + Math.round((workArea.height - height) / 2));
		}
		else {
			this._animationState = AnimationState.LEFT;
			this._arrowIconAnimation.gestureBegin('arrow1-right-symbolic.svg', false);
			this._arrowIconAnimation.set_position(workArea.x + workArea.width - 2 * width, workArea.y + Math.round((workArea.height - height) / 2));
		}
	}

	_getWorkArea() {
		const window = this._focusWindow;
		if (window)
			return window.get_frame_rect();
		return Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.currentMonitor.index);
	}

	/**
     * @param gestureDirection direction of swipe gesture left to right or right to left
     */
	_getClutterKeyForFocusedApp(gestureDirection) {
		const focusApp = this._windowTracker.focus_app;
		const keyBind = focusApp ? this._appForwardBackKeyBinds[focusApp.get_id()] : null;
		if (keyBind) {
			// if keyBind[1] is true => reverse order or keys
			const returnBackKey = (gestureDirection === SwipeGestureDirection.LeftToRight) !== keyBind[1];
			switch (keyBind[0]) {
				case ForwardBackKeyBinds['Forward/Backward']:
					return [returnBackKey ? Clutter.KEY_Back : Clutter.KEY_Forward];
				case ForwardBackKeyBinds['Page Up/Down']:
					return [returnBackKey ? Clutter.KEY_Page_Up : Clutter.KEY_Page_Down];
				case ForwardBackKeyBinds['Right/Left']:
					return [returnBackKey ? Clutter.KEY_Left : Clutter.KEY_Right];
				case ForwardBackKeyBinds['Audio Next/Prev']:
					return [returnBackKey ? Clutter.KEY_AudioPrev : Clutter.KEY_AudioNext];
				case ForwardBackKeyBinds['Tab Next/Prev']:
					return [Clutter.KEY_Control_L, returnBackKey ? Clutter.KEY_Page_Up : Clutter.KEY_Page_Down];
			}
		}

		// default key bind
		return [gestureDirection === SwipeGestureDirection.LeftToRight ? Clutter.KEY_Back : Clutter.KEY_Forward];
	}
};
