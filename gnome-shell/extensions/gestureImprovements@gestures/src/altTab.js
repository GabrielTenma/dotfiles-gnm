/* exported AltTabGestureExtension */
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { AltTabConstants, ExtSettings } = Me.imports.constants;
const { TouchpadSwipeGesture } = Me.imports.src.swipeTracker;
const Main = imports.ui.main;
const { WindowSwitcherPopup } = imports.ui.altTab;
let dummyWinCount = AltTabConstants.DUMMY_WIN_COUNT;

function getIndexForProgress(progress, nelement) {
	let index = Math.floor(progress * (nelement + 2 * dummyWinCount));
	index = index - dummyWinCount;
	return Math.clamp(index, 0, nelement - 1);
}

// index -> index + AltTabConstants.DUMMY_WIN_COUNT
function getAvgProgressForIndex(index, nelement) {
	index = index + dummyWinCount;
	const progress = (index + 0.5) / (nelement + 2 * dummyWinCount);
	return progress;
}

// declare enum
var AltTabExtState;
(function (AltTabExtState) {
	AltTabExtState[AltTabExtState['DISABLED'] = 0] = 'DISABLED';
	AltTabExtState[AltTabExtState['DEFAULT'] = 1] = 'DEFAULT';
	AltTabExtState[AltTabExtState['ALTTABDELAY'] = 2] = 'ALTTABDELAY';
	AltTabExtState[AltTabExtState['ALTTAB'] = 3] = 'ALTTAB';
})(AltTabExtState || (AltTabExtState = {}));

var AltTabGestureExtension = class AltTabGestureExtension {
	constructor() {
		this._extState = AltTabExtState.DISABLED;
		this._progress = 0;
		this._altTabTimeoutId = 0;
		this._connectHandlers = [];
		this._touchpadSwipeTracker = new TouchpadSwipeGesture((ExtSettings.DEFAULT_SESSION_WORKSPACE_GESTURE ? [4] : [3]), Shell.ActionMode.ALL, Clutter.Orientation.HORIZONTAL, false, this._checkAllowedGesture.bind(this));
		this._adjustment = new St.Adjustment({
			value: 0,
			lower: 0,
			upper: 1,
		});
	}

	_checkAllowedGesture() {
		return (this._extState <= AltTabExtState.DEFAULT &&
            Main.actionMode === Shell.ActionMode.NORMAL &&
            !(ExtSettings.APP_GESTURES && this._touchpadSwipeTracker.isItHoldAndSwipeGesture()));
	}

	apply() {
		this._adjustment.connect('notify::value', this._onUpdateAdjustmentValue.bind(this));
		this._connectHandlers.push(this._touchpadSwipeTracker.connect('begin', this._gestureBegin.bind(this)));
		this._connectHandlers.push(this._touchpadSwipeTracker.connect('update', this._gestureUpdate.bind(this)));
		this._connectHandlers.push(this._touchpadSwipeTracker.connect('end', this._gestureEnd.bind(this)));
		this._extState = AltTabExtState.DEFAULT;
	}

	destroy() {
		this._extState = AltTabExtState.DISABLED;
		this._connectHandlers.forEach(handle => this._touchpadSwipeTracker.disconnect(handle));
		this._touchpadSwipeTracker.destroy();
		this._connectHandlers = [];
		this._adjustment.run_dispose();
		if (this._switcher) {
			this._switcher.destroy();
			this._switcher = undefined;
		}
	}

	_onUpdateAdjustmentValue() {
		if (this._extState === AltTabExtState.ALTTAB && this._switcher) {
			const nelement = this._switcher._items.length;
			if (nelement > 1) {
				const n = getIndexForProgress(this._adjustment.value, nelement);
				this._switcher._select(n);
				const adjustment = this._switcher._switcherList._scrollView.hscroll.adjustment;
				const transition = adjustment.get_transition('value');
				if (transition) {
					transition.advance(AltTabConstants.POPUP_SCROLL_TIME);
				}
			}
		}
	}

	_gestureBegin() {
		this._progress = 0;
		if (this._extState === AltTabExtState.DEFAULT) {
			this._switcher = new WindowSwitcherPopup();
			this._switcher._switcherList.add_style_class_name('gie-alttab-quick-transition');
			this._switcher.connect('destroy', () => {
				this._switcher = undefined;
				this._reset();
			});

			// remove timeout entirely
			this._switcher._resetNoModsTimeout = function () {
				if (this._noModsTimeoutId) {
					GLib.source_remove(this._noModsTimeoutId);
					this._noModsTimeoutId = 0;
				}
			};

			const nelement = this._switcher._items.length;
			if (nelement > 0) {
				this._switcher.show(false, 'switch-windows', 0);
				this._switcher._popModal();
				if (this._switcher._initialDelayTimeoutId !== 0) {
					GLib.source_remove(this._switcher._initialDelayTimeoutId);
					this._switcher._initialDelayTimeoutId = 0;
				}

				const leftOver = AltTabConstants.MIN_WIN_COUNT - nelement;
				if (leftOver > 0) {
					dummyWinCount = Math.max(AltTabConstants.DUMMY_WIN_COUNT, Math.ceil(leftOver / 2));
				}
				else {
					dummyWinCount = AltTabConstants.DUMMY_WIN_COUNT;
				}

				if (nelement === 1) {
					this._switcher._select(0);
					this._progress = 0;
				}
				else {
					this._progress = getAvgProgressForIndex(1, nelement);
					this._switcher._select(1);
				}

				this._adjustment.value = 0;
				this._extState = AltTabExtState.ALTTABDELAY;
				this._altTabTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, AltTabConstants.DELAY_DURATION, () => {
					Main.osdWindowManager.hideAll();
					if (this._switcher)
						this._switcher.opacity = 255;
					this._adjustment.value = this._progress;
					this._extState = AltTabExtState.ALTTAB;
					this._altTabTimeoutId = 0;
					return GLib.SOURCE_REMOVE;
				});
			}
			else {
				this._switcher.destroy();
				this._switcher = undefined;
			}
		}
	}

	_gestureUpdate(_gesture, _time, delta, distance) {
		if (this._extState > AltTabExtState.ALTTABDELAY) {
			this._progress = Math.clamp(this._progress + delta / distance, 0, 1);
			this._adjustment.value = this._progress;
		}
	}

	_gestureEnd() {
		if (this._switcher) {
			const win = this._switcher._items[this._switcher._selectedIndex].window;
			Main.activateWindow(win);
			this._switcher.destroy();
			this._switcher = undefined;
		}

		this._reset();
	}

	_reset() {
		if (this._extState > AltTabExtState.DEFAULT) {
			this._extState = AltTabExtState.DEFAULT;
			if (this._altTabTimeoutId) {
				GLib.source_remove(this._altTabTimeoutId);
				this._altTabTimeoutId = 0;
			}

			this._progress = 0;
			this._adjustment.value = 0;
		}

		this._extState = AltTabExtState.DEFAULT;
	}
};
