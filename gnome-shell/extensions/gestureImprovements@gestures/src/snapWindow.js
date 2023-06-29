/* exported SnapWindowExtension */
const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { registerClass } = Me.imports.common.utils.gobject;
const { ExtSettings } = Me.imports.constants;
const { createSwipeTracker } = Me.imports.src.swipeTracker;
const { easeActor, easeAdjustment } = Me.imports.src.utils.environment;
const { getVirtualKeyboard } = Me.imports.src.utils.keyboard;
const Main = imports.ui.main;
const Utils = imports.misc.util;
const { SwipeTracker } = imports.ui.swipeTracker;
const WINDOW_ANIMATION_TIME = 250;
const UPDATED_WINDOW_ANIMATION_TIME = 150;
const TRIGGER_THRESHOLD = 0.1;

// define enum
var GestureMaxUnMaxState;
(function (GestureMaxUnMaxState) {
	GestureMaxUnMaxState[GestureMaxUnMaxState['MINIMIZE'] = -1] = 'MINIMIZE';
	GestureMaxUnMaxState[GestureMaxUnMaxState['UNMAXIMIZE'] = 0] = 'UNMAXIMIZE';
	GestureMaxUnMaxState[GestureMaxUnMaxState['MAXIMIZE'] = 1] = 'MAXIMIZE';
	GestureMaxUnMaxState[GestureMaxUnMaxState['FULLSCREEN'] = 2] = 'FULLSCREEN';
})(GestureMaxUnMaxState || (GestureMaxUnMaxState = {}));

// define enum
var GestureTileState;
(function (GestureTileState) {
	GestureTileState[GestureTileState['RIGHT_TILE'] = -1] = 'RIGHT_TILE';
	GestureTileState[GestureTileState['NORMAL'] = 0] = 'NORMAL';
	GestureTileState[GestureTileState['LEFT_TILE'] = 1] = 'LEFT_TILE';
})(GestureTileState || (GestureTileState = {}));

const TilePreview = registerClass(class TilePreview extends St.Widget {
	_init() {
		super._init({
			reactive: false,
			style_class: 'tile-preview',
			visible: false,
		});

		this._direction = Clutter.Orientation.VERTICAL;
		this.add_style_class_name('gie-tile-window-preview');
		this.connect('destroy', this._onDestroy.bind(this));
		this._adjustment = new St.Adjustment({
			actor: this,
			value: 0,
			lower: -1,
			upper: 2,
		});

		this._adjustment.connect('notify::value', this._valueChanged.bind(this));
		this._virtualDevice = getVirtualKeyboard();
	}

	open(window, currentProgress) {
		if (this.visible) {
			return false;
		}

		this._window = window;
		this._fullscreenBox = global.display.get_monitor_geometry(window.get_monitor());
		this._maximizeBox = this.getMaximizedBox(window);
		this._normalBox = this.getNormalBox(window);
		this._leftSnapBox = this._maximizeBox.copy();
		this._rightSnapBox = this._maximizeBox.copy();
		this._minimizeBox = this.getMinimizedBox(this._window, this._maximizeBox);
		this._leftSnapBox.width /= 2;
		this._rightSnapBox.width /= 2;
		this._rightSnapBox.x += this._rightSnapBox.width;
		this._direction = Clutter.Orientation.VERTICAL;
		this.opacity = 0;
		this._adjustment.value = currentProgress;
		this._valueChanged();
		this.visible = true;
		this.easeOpacity(255);
		return true;
	}

	finish(duration, state) {
		const callback = () => {
			if (!this.visible)
				return;
			this.easeOpacity(0, () => this.visible = false);
			if (this._window) {
				// maximize-unmaximize
				if (this._direction === Clutter.Orientation.VERTICAL) {
					// Main.wm.skipNextEffect(this._window.get_compositor_private() as Meta.WindowActor);
					const stSettings = St.Settings.get();

					// speedup animations
					const prevSlowdown = stSettings.slow_down_factor;
					stSettings.slow_down_factor = UPDATED_WINDOW_ANIMATION_TIME / WINDOW_ANIMATION_TIME;
					switch (state) {
						case GestureMaxUnMaxState.MINIMIZE:
							this._window.minimize();
							break;
						case GestureMaxUnMaxState.UNMAXIMIZE:
							if (this._window.is_fullscreen())
								this._window.unmake_fullscreen();
							this._window.unmaximize(Meta.MaximizeFlags.BOTH);
							break;
						case GestureMaxUnMaxState.MAXIMIZE:
							if (this._window.is_fullscreen())
								this._window.unmake_fullscreen();
							this._window.maximize(Meta.MaximizeFlags.BOTH);
							break;
						case GestureMaxUnMaxState.FULLSCREEN:
							this._window.make_fullscreen();
							break;
					}

					stSettings.slow_down_factor = prevSlowdown;
				}

				// snap-left,normal,snap-right
				else {
					if (state !== GestureTileState.NORMAL) {
						const keys = [Clutter.KEY_Super_L, (state === GestureTileState.LEFT_TILE ? Clutter.KEY_Left : Clutter.KEY_Right)];
						this._virtualDevice.sendKeys(keys);
					}
				}
			}

			this._window = undefined;
			this._normalBox = undefined;
			this._maximizeBox = undefined;
			this._minimizeBox = undefined;
			this._leftSnapBox = undefined;
			this._rightSnapBox = undefined;
			this._direction = Clutter.Orientation.VERTICAL;
		};

		easeAdjustment(this._adjustment, state, {
			duration: duration,
			mode: Clutter.AnimationMode.EASE_OUT_QUAD,
			onStopped: callback,
		});
	}

	_valueChanged() {
		let progress = this._adjustment.value;
		let startBox, endBox;
		if (this._direction === Clutter.Orientation.VERTICAL) {
			if (progress < GestureMaxUnMaxState.UNMAXIMIZE) {
				startBox = this._minimizeBox;
				endBox = this._normalBox;
				progress -= GestureMaxUnMaxState.MINIMIZE;
			}
			else if (progress <= GestureMaxUnMaxState.MAXIMIZE) {
				// no particular reason for equality here
				startBox = this._normalBox;
				endBox = this._maximizeBox;
				progress -= GestureMaxUnMaxState.UNMAXIMIZE;
			}
			else {
				startBox = this._maximizeBox;
				endBox = this._fullscreenBox;
				progress -= GestureMaxUnMaxState.MAXIMIZE;
			}
		}
		else {
			startBox = this._normalBox;
			if (progress >= GestureTileState.NORMAL) {
				endBox = this._leftSnapBox;
			}
			else {
				endBox = this._rightSnapBox;
				progress = -progress;
			}
		}

		if (!startBox || !endBox) {
			return;
		}

		const [x, y] = [
			Utils.lerp(startBox.x, endBox.x, progress),
			Utils.lerp(startBox.y, endBox.y, progress),
		];

		const [width, height] = [
			Utils.lerp(startBox.width, endBox.width, progress),
			Utils.lerp(startBox.height, endBox.height, progress),
		];

		this.set_position(x, y);
		this.set_size(width, height);
	}

	_onDestroy() {
		this._adjustment.run_dispose();
	}

	switchToSnapping(value) {
		this._adjustment.remove_transition('value');
		this._adjustment.value = value;
		this._direction = Clutter.Orientation.HORIZONTAL;
	}

	easeOpacity(value, callback) {
		easeActor(this, {
			opacity: value,
			duration: UPDATED_WINDOW_ANIMATION_TIME,
			mode: Clutter.AnimationMode.EASE_OUT_QUAD,
			onStopped: () => {
				if (callback)
					callback();
			},
		});
	}

	get adjustment() {
		return this._adjustment;
	}

	getMinimizedBox(window, monitorWorkArea) {
		const [has_icon, icon_geometry] = window.get_icon_geometry();
		if (has_icon)
			return icon_geometry;
		const rect = monitorWorkArea.copy();
		rect.width = 0;
		rect.height = 0;
		return rect;
	}

	getNormalBox(window) {
		const normalBox = window.get_frame_rect();
		if (window.get_maximized() !== Meta.MaximizeFlags.BOTH)
			return normalBox;
		const [width, height] = [
			Math.round(normalBox.width * 0.05),
			Math.round(normalBox.height * 0.05),
		];

		normalBox.x += width;
		normalBox.width -= 2 * width;
		normalBox.y += height;
		normalBox.height -= 2 * height;
		return normalBox;
	}

	getMaximizedBox(window) {
		const monitor = window.get_monitor();
		const maximizedBox = Main.layoutManager.getWorkAreaForMonitor(monitor);
		if (!window.is_fullscreen())
			return maximizedBox;
		const height = Math.round(maximizedBox.height * 0.025);
		maximizedBox.y += height;
		maximizedBox.height -= 2 * height;
		return maximizedBox;
	}
});

var SnapWindowExtension = class SnapWindowExtension {
	constructor() {
		this._connectors = [];
		this._toggledDirection = false;
		this._allowChangeDirection = false;
		this._swipeTracker = createSwipeTracker(global.stage, (ExtSettings.DEFAULT_OVERVIEW_GESTURE ? [4] : [3]), Shell.ActionMode.NORMAL, Clutter.Orientation.VERTICAL, true, 1, { allowTouch: false });
		this._swipeTracker.allowLongSwipes = true;
		this._touchpadSwipeGesture = this._swipeTracker._touchpadGesture;
		this._tilePreview = new TilePreview();
		Main.layoutManager.uiGroup.add_child(this._tilePreview);
		this._uiGroupAddedActorId = Main.layoutManager.uiGroup.connect('actor-added', () => {
			Main.layoutManager.uiGroup.set_child_above_sibling(this._tilePreview, null);
		});

		Main.layoutManager.uiGroup.set_child_above_sibling(this._tilePreview, null);
	}

	apply() {
		this._swipeTracker.orientation = Clutter.Orientation.VERTICAL;
		this._connectors.push(this._swipeTracker.connect('begin', this._gestureBegin.bind(this)));
		this._connectors.push(this._swipeTracker.connect('update', this._gestureUpdate.bind(this)));
		this._connectors.push(this._swipeTracker.connect('end', this._gestureEnd.bind(this)));
	}

	destroy() {
		if (this._uiGroupAddedActorId) {
			Main.layoutManager.uiGroup.disconnect(this._uiGroupAddedActorId);
			this._uiGroupAddedActorId = 0;
		}

		this._connectors.forEach(connector => this._swipeTracker.disconnect(connector));
		Main.layoutManager.uiGroup.remove_child(this._tilePreview);
		this._swipeTracker.destroy();
		this._tilePreview.destroy();
	}

	_gestureBegin(tracker, monitor) {
		const window = global.display.get_focus_window();

		// fullscreen window's can't be maximized :O
		// if window can't be maximized and window is not fullscreen, return
		if (!window || !(window.can_maximize() || window.is_fullscreen())) {
			return;
		}

		// window is on different monitor
		if (window.get_monitor() !== monitor) {
			return;
		}

		const currentMonitor = window.get_monitor();
		const monitorArea = global.display.get_monitor_geometry(currentMonitor);
		const progress = window.is_fullscreen() ? GestureMaxUnMaxState.FULLSCREEN
			: window.get_maximized() === Meta.MaximizeFlags.BOTH ? GestureMaxUnMaxState.MAXIMIZE : GestureMaxUnMaxState.UNMAXIMIZE;

		this._toggledDirection = false;
		this._allowChangeDirection = false;
		const snapPoints = [];
		switch (progress) {
			case GestureMaxUnMaxState.UNMAXIMIZE:
				snapPoints.push(GestureTileState.RIGHT_TILE, GestureTileState.NORMAL, GestureTileState.LEFT_TILE);

				// allow tiling gesture, when window is unmaximized and minimized gesture is not enabled
				this._allowChangeDirection = !ExtSettings.ALLOW_MINIMIZE_WINDOW;
				break;
			case GestureMaxUnMaxState.MAXIMIZE:
				snapPoints.push(GestureMaxUnMaxState.UNMAXIMIZE, GestureMaxUnMaxState.MAXIMIZE);
				if (!window.is_monitor_sized() && !monitorArea.equal(window.get_buffer_rect()))
					snapPoints.push(GestureMaxUnMaxState.FULLSCREEN);
				break;
			case GestureMaxUnMaxState.FULLSCREEN:
				snapPoints.push(GestureMaxUnMaxState.MAXIMIZE, GestureMaxUnMaxState.FULLSCREEN);
				break;
		}

		if (this._tilePreview.open(window, progress)) {
			tracker.confirmSwipe(monitorArea.height, snapPoints, progress, progress);
		}
	}

	_gestureUpdate(_tracker, progress) {
		// log(`progress: ${progress}, toggled: ${this._toggledDirection}`);
		if (this._toggledDirection) {
			this._tilePreview.adjustment.value = progress;
			return;
		}

		// if tiling gesture is not allowed or progress is above unmaximized state
		if (!this._allowChangeDirection || progress >= GestureMaxUnMaxState.UNMAXIMIZE) {
			this._tilePreview.adjustment.value = progress;
		}

		// switch to horizontal
		else if (this._allowChangeDirection && progress <= GestureMaxUnMaxState.UNMAXIMIZE - TRIGGER_THRESHOLD) {
			this._toggledDirection = true;
			this._touchpadSwipeGesture.switchDirectionTo(Clutter.Orientation.HORIZONTAL);
			this._swipeTracker._progress = GestureTileState.NORMAL;
			this._swipeTracker._history.reset();
			this._tilePreview.switchToSnapping(GestureTileState.NORMAL);
		}
	}

	_gestureEnd(_tracker, duration, progress) {
		this._tilePreview.finish(duration, progress);
	}
};
