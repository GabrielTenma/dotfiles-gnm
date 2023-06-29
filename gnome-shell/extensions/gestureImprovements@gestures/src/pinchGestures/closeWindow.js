/* exported CloseWindowExtension */
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { PinchGestureType } = Me.imports.common.settings;
const { WIGET_SHOWING_DURATION } = Me.imports.constants;
const { TouchpadPinchGesture } = Me.imports.src.trackers.pinchTracker;
const { easeActor } = Me.imports.src.utils.environment;
const { getVirtualKeyboard } = Me.imports.src.utils.keyboard;
const Main = imports.ui.main;
const Util = imports.misc.util;
const END_OPACITY = 0;
const END_SCALE = 0.5;
var CloseWindowGestureState;
(function (CloseWindowGestureState) {
	CloseWindowGestureState[CloseWindowGestureState['PINCH_IN'] = -1] = 'PINCH_IN';
	CloseWindowGestureState[CloseWindowGestureState['DEFAULT'] = 0] = 'DEFAULT';
})(CloseWindowGestureState || (CloseWindowGestureState = {}));

var CloseWindowExtension = class CloseWindowExtension {
	constructor(nfingers, closeType) {
		this._closeType = closeType;
		this._keyboard = getVirtualKeyboard();
		this._preview = new St.Widget({
			reactive: false,
			style_class: 'gie-close-window-preview',
			visible: false,
		});

		this._preview.set_pivot_point(0.5, 0.5);
		Main.layoutManager.uiGroup.add_child(this._preview);
		this._pinchTracker = new TouchpadPinchGesture({
			nfingers: nfingers,
			allowedModes: Shell.ActionMode.NORMAL,
			pinchSpeed: 0.25,
		});

		this._pinchTracker.connect('begin', this.gestureBegin.bind(this));
		this._pinchTracker.connect('update', this.gestureUpdate.bind(this));
		this._pinchTracker.connect('end', this.gestureEnd.bind(this));
	}

	destroy() {
		this._pinchTracker.destroy();
		this._preview.destroy();
	}

	gestureBegin(tracker) {
		// if we are currently in middle of animations, ignore this event
		if (this._focusWindow)
			return;
		this._focusWindow = global.display.get_focus_window();
		if (!this._focusWindow)
			return;
		tracker.confirmPinch(0, [CloseWindowGestureState.PINCH_IN, CloseWindowGestureState.DEFAULT], CloseWindowGestureState.DEFAULT);
		const frame = this._focusWindow.get_frame_rect();
		this._preview.set_position(frame.x, frame.y);
		this._preview.set_size(frame.width, frame.height);

		// animate showing widget
		this._preview.opacity = 0;
		this._preview.show();
		easeActor(this._preview, {
			opacity: 255,
			mode: Clutter.AnimationMode.EASE_OUT_QUAD,
			duration: WIGET_SHOWING_DURATION,
		});
	}

	gestureUpdate(_tracker, progress) {
		progress = CloseWindowGestureState.DEFAULT - progress;
		const scale = Util.lerp(1, END_SCALE, progress);
		this._preview.set_scale(scale, scale);
		this._preview.opacity = Util.lerp(255, END_OPACITY, progress);
	}

	gestureEnd(_tracker, duration, progress) {
		switch (progress) {
			case CloseWindowGestureState.DEFAULT:
				this._animatePreview(false, duration);
				break;
			case CloseWindowGestureState.PINCH_IN:
				this._animatePreview(true, duration, this._invokeGestureCompleteAction.bind(this));
		}
	}

	_invokeGestureCompleteAction() {
		var _a, _b;
		switch (this._closeType) {
			case PinchGestureType.CLOSE_WINDOW:
				(_b = (_a = this._focusWindow) === null || _a === void 0 ? void 0 : _a.delete) === null || _b === void 0 ? void 0 : _b.call(_a, global.get_current_time());
				break;
			case PinchGestureType.CLOSE_DOCUMENT:
				this._keyboard.sendKeys([Clutter.KEY_Control_L, Clutter.KEY_w]);
		}
	}

	_animatePreview(gestureCompleted, duration, callback) {
		easeActor(this._preview, {
			opacity: gestureCompleted ? END_OPACITY : 255,
			scaleX: gestureCompleted ? END_SCALE : 1,
			scaleY: gestureCompleted ? END_SCALE : 1,
			duration,
			mode: Clutter.AnimationMode.EASE_OUT_QUAD,
			onStopped: () => {
				if (callback)
					callback();
				this._gestureAnimationDone();
			},
		});
	}

	_gestureAnimationDone() {
		this._preview.hide();
		this._preview.opacity = 255;
		this._preview.set_scale(1, 1);
		this._focusWindow = undefined;
	}
};
