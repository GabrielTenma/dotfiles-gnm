/* exported GestureExtension */
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const Shell = imports.gi.Shell;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { ExtSettings, OverviewControlsState } = Me.imports.constants;
const { createSwipeTracker, TouchpadSwipeGesture } = Me.imports.src.swipeTracker;
const Main = imports.ui.main;

function connectTouchpadEventToTracker(tracker) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	global.stage.connectObject('captured-event::touchpad', tracker._handleEvent.bind(tracker), tracker);
}

function disconnectTouchpadEventFromTracker(tracker) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	global.stage.disconnectObject(tracker);
}

class SwipeTrackerEndPointsModifer {
	constructor() {
		this._firstVal = 0;
		this._lastVal = 0;
	}

	apply() {
		this._swipeTracker.connect('begin', this._gestureBegin.bind(this));
		this._swipeTracker.connect('update', this._gestureUpdate.bind(this));
		this._swipeTracker.connect('end', this._gestureEnd.bind(this));
	}

	_modifySnapPoints(tracker, callback) {
		const _tracker = {
			orientation: Clutter.Orientation.HORIZONTAL,
			confirmSwipe: (distance, snapPoints, currentProgress, cancelProgress) => {
				this._firstVal = snapPoints[0];
				this._lastVal = snapPoints[snapPoints.length - 1];
				snapPoints.unshift(this._firstVal - 1);
				snapPoints.push(this._lastVal + 1);
				tracker.orientation = _tracker.orientation;
				tracker.confirmSwipe(distance, snapPoints, currentProgress, cancelProgress);
			},
		};

		callback(_tracker);
	}

	destroy() {
		this._swipeTracker.enabled = false;
	}
}
class WorkspaceAnimationModifier extends SwipeTrackerEndPointsModifer {
	constructor(wm) {
		super();
		this._workspaceAnimation = wm._workspaceAnimation;
		this._swipeTracker = createSwipeTracker(global.stage, (ExtSettings.DEFAULT_SESSION_WORKSPACE_GESTURE ? [3] : [4]), Shell.ActionMode.NORMAL, Clutter.Orientation.HORIZONTAL, ExtSettings.FOLLOW_NATURAL_SCROLL, 1, { allowTouch: false });
	}

	apply() {
		if (this._workspaceAnimation._swipeTracker._touchpadGesture) {
			disconnectTouchpadEventFromTracker(this._workspaceAnimation._swipeTracker._touchpadGesture);
		}

		super.apply();
	}

	_gestureBegin(tracker, monitor) {
		super._modifySnapPoints(tracker, (shallowTracker) => {
			this._workspaceAnimation._switchWorkspaceBegin(shallowTracker, monitor);
			tracker.orientation = shallowTracker.orientation;
		});
	}

	_gestureUpdate(tracker, progress) {
		if (progress < this._firstVal) {
			progress = this._firstVal - (this._firstVal - progress) * 0.05;
		}
		else if (progress > this._lastVal) {
			progress = this._lastVal + (progress - this._lastVal) * 0.05;
		}

		this._workspaceAnimation._switchWorkspaceUpdate(tracker, progress);
	}

	_gestureEnd(tracker, duration, progress) {
		progress = Math.clamp(progress, this._firstVal, this._lastVal);
		this._workspaceAnimation._switchWorkspaceEnd(tracker, duration, progress);
	}

	destroy() {
		this._swipeTracker.destroy();
		const swipeTracker = this._workspaceAnimation._swipeTracker;
		if (swipeTracker._touchpadGesture) {
			connectTouchpadEventToTracker(swipeTracker._touchpadGesture);
		}

		super.destroy();
	}
}

var GestureExtension = class GestureExtension {
	constructor() {
		this._stateAdjustment = Main.overview._overview._controls._stateAdjustment;
		this._swipeTrackers = [
			{
				swipeTracker: Main.overview._overview._controls._workspacesDisplay._swipeTracker,
				nfingers: [3, 4],
				disableOldGesture: true,
				followNaturalScroll: ExtSettings.FOLLOW_NATURAL_SCROLL,
				modes: Shell.ActionMode.OVERVIEW,
				gestureSpeed: 1,
				checkAllowedGesture: (event) => {
					if (Main.overview._overview._controls._searchController.searchActive) {
						return false;
					}

					if (event.get_touchpad_gesture_finger_count() === 4) {
						return true;
					}
					else {
						return this._stateAdjustment.value === OverviewControlsState.WINDOW_PICKER;
					}
				},
			},
			{
				swipeTracker: Main.overview._overview._controls._appDisplay._swipeTracker,
				nfingers: [3],
				disableOldGesture: true,
				followNaturalScroll: ExtSettings.FOLLOW_NATURAL_SCROLL,
				modes: Shell.ActionMode.OVERVIEW,
				checkAllowedGesture: () => {
					if (Main.overview._overview._controls._searchController.searchActive) {
						return false;
					}

					return this._stateAdjustment.value === OverviewControlsState.APP_GRID;
				},
			},
		];

		this._workspaceAnimationModifier = new WorkspaceAnimationModifier(Main.wm);
	}

	apply() {
		this._workspaceAnimationModifier.apply();
		this._swipeTrackers.forEach(entry => {
			var _a;
			const { swipeTracker, nfingers, disableOldGesture, followNaturalScroll, modes, checkAllowedGesture, } = entry;
			const gestureSpeed = (_a = entry.gestureSpeed) !== null && _a !== void 0 ? _a : 1;
			const touchpadGesture = new TouchpadSwipeGesture(nfingers, modes, swipeTracker.orientation, followNaturalScroll, checkAllowedGesture, gestureSpeed);
			this._attachGestureToTracker(swipeTracker, touchpadGesture, disableOldGesture);
		});
	}

	destroy() {
		this._swipeTrackers.reverse().forEach(entry => {
			var _a;
			const { swipeTracker, disableOldGesture } = entry;
			(_a = swipeTracker._touchpadGesture) === null || _a === void 0 ? void 0 : _a.destroy();
			swipeTracker._touchpadGesture = swipeTracker.__oldTouchpadGesture;
			swipeTracker.__oldTouchpadGesture = undefined;
			if (swipeTracker._touchpadGesture && disableOldGesture) {
				connectTouchpadEventToTracker(swipeTracker._touchpadGesture);
			}
		});

		this._workspaceAnimationModifier.destroy();
	}

	_attachGestureToTracker(swipeTracker, touchpadSwipeGesture, disablePrevious) {
		if (swipeTracker._touchpadGesture && disablePrevious) {
			disconnectTouchpadEventFromTracker(swipeTracker._touchpadGesture);
			swipeTracker.__oldTouchpadGesture = swipeTracker._touchpadGesture;
		}

		swipeTracker._touchpadGesture = touchpadSwipeGesture;
		swipeTracker._touchpadGesture.connect('begin', swipeTracker._beginGesture.bind(swipeTracker));
		swipeTracker._touchpadGesture.connect('update', swipeTracker._updateGesture.bind(swipeTracker));
		swipeTracker._touchpadGesture.connect('end', swipeTracker._endTouchpadGesture.bind(swipeTracker));
		swipeTracker.bind_property('enabled', swipeTracker._touchpadGesture, 'enabled', 0);
		swipeTracker.bind_property('orientation', swipeTracker._touchpadGesture, 'orientation', GObject.BindingFlags.SYNC_CREATE);
	}
};
