/* exported TouchpadPinchGesture */
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { registerClass } = Me.imports.common.utils.gobject;
const { TouchpadConstants } = Me.imports.constants;
const DBusUtils = Me.imports.src.utils.dbus;
const Main = imports.ui.main;
const MIN_ANIMATION_DURATION = 100;
const MAX_ANIMATION_DURATION = 400;

// Derivative of easeOutCubic at t=0
const DURATION_MULTIPLIER = 3;
const ANIMATION_BASE_VELOCITY = 0.002;
const EVENT_HISTORY_THRESHOLD_MS = 150;
const DECELERATION_TOUCHPAD = 0.997;
const VELOCITY_CURVE_THRESHOLD = 2;
const DECELERATION_PARABOLA_MULTIPLIER = 0.35;
class EventHistoryTracker {
	constructor() {
		this._data = [];
	}

	reset() {
		this._data = [];
	}

	trim(time) {
		const thresholdTime = time - EVENT_HISTORY_THRESHOLD_MS;
		const index = this._data.findIndex(r => r.time >= thresholdTime);
		this._data.splice(0, index);
	}

	append(time, delta) {
		this.trim(time);
		this._data.push({ time, delta });
	}

	calculateVelocity() {
		if (this._data.length < 2)
			return 0;
		const firstTime = this._data[0].time;
		const lastTime = this._data[this._data.length - 1].time;
		if (firstTime === lastTime)
			return 0;
		const totalDelta = this._data.slice(1).map(a => a.delta).reduce((a, b) => a + b);
		const period = lastTime - firstTime;
		return totalDelta / period;
	}
}

// define enum
var TouchpadState;
(function (TouchpadState) {
	TouchpadState[TouchpadState['NONE'] = 0] = 'NONE';
	TouchpadState[TouchpadState['HANDLING'] = 1] = 'HANDLING';
	TouchpadState[TouchpadState['IGNORED'] = 2] = 'IGNORED';
})(TouchpadState || (TouchpadState = {}));

var GestureACKState;
(function (GestureACKState) {
	GestureACKState[GestureACKState['NONE'] = 0] = 'NONE';
	GestureACKState[GestureACKState['PENDING_ACK'] = 1] = 'PENDING_ACK';
	GestureACKState[GestureACKState['ACKED'] = 2] = 'ACKED';
})(GestureACKState || (GestureACKState = {}));

var TouchpadPinchGesture = registerClass({
	Properties: {},
	Signals: {
		'begin': { param_types: [] },
		'update': { param_types: [GObject.TYPE_DOUBLE] },
		'end': { param_types: [GObject.TYPE_DOUBLE, GObject.TYPE_DOUBLE] },
	},
}, class TouchpadPinchGesture extends GObject.Object {
	_init(params) {
		var _a;
		super._init();
		this._state = TouchpadState.NONE;
		this._ackState = GestureACKState.NONE;
		this._progress_scale = 1.0;
		this._snapPoints = [0, 1, 2];
		this.enabled = true;
		this._initialProgress = 0;
		this._nfingers = params.nfingers;
		this._allowedModes = params.allowedModes;
		this._checkAllowedGesture = params.checkAllowedGesture;
		if (Meta.is_wayland_compositor()) {
			this._stageCaptureEvent = global.stage.connect('captured-event::touchpad', this._handleEvent.bind(this));
		}
		else {
			DBusUtils.subscribe(this._handleEvent.bind(this));
		}

		this._historyTracker = new EventHistoryTracker();
		this.PINCH_MULTIPLIER = TouchpadConstants.PINCH_MULTIPLIER * ((_a = params.pinchSpeed) !== null && _a !== void 0 ? _a : 1.0);
	}

	_handleEvent(_actor, event) {
		if (event.type() !== Clutter.EventType.TOUCHPAD_PINCH)
			return Clutter.EVENT_PROPAGATE;
		const gesturePhase = event.get_gesture_phase();
		if (gesturePhase === Clutter.TouchpadGesturePhase.BEGIN) {
			this._state = TouchpadState.NONE;
			this._historyTracker.reset();
		}

		if (this._state === TouchpadState.IGNORED || !this.enabled)
			return Clutter.EVENT_PROPAGATE;
		if ((this._allowedModes !== Shell.ActionMode.ALL) && ((this._allowedModes & Main.actionMode) === 0)) {
			this._interrupt();
			this._state = TouchpadState.IGNORED;
			return Clutter.EVENT_PROPAGATE;
		}

		if (!this._nfingers.includes(event.get_touchpad_gesture_finger_count())) {
			this._state = TouchpadState.IGNORED;
			return Clutter.EVENT_PROPAGATE;
		}

		if (gesturePhase === Clutter.TouchpadGesturePhase.BEGIN && this._checkAllowedGesture !== undefined) {
			try {
				if (this._checkAllowedGesture(event) !== true) {
					this._state = TouchpadState.IGNORED;
					return Clutter.EVENT_PROPAGATE;
				}
			}
			catch (ex) {
				this._state = TouchpadState.IGNORED;
				return Clutter.EVENT_PROPAGATE;
			}
		}

		this._state = TouchpadState.HANDLING;
		const time = event.get_time();
		const pinch_scale = event.get_gesture_pinch_scale();
		switch (gesturePhase) {
			case Clutter.TouchpadGesturePhase.BEGIN:
				// this._previous_scale = 1.0;
				this._emitBegin();
				break;
			case Clutter.TouchpadGesturePhase.UPDATE:
				this._emitUpdate(time, pinch_scale);
				break;
			case Clutter.TouchpadGesturePhase.END:
			case Clutter.TouchpadGesturePhase.CANCEL:
				this._emitEnd(time);
				this._state = TouchpadState.NONE;
				this._historyTracker.reset();
				break;
		}

		return Clutter.EVENT_STOP;
	}

	_getBounds() {
		return [this._snapPoints[0], this._snapPoints[this._snapPoints.length - 1]];
	}

	/**
     * @param currentProgress must be in increasing order
     */
	confirmPinch(_distance, snapPoints, currentProgress) {
		if (this._ackState !== GestureACKState.PENDING_ACK)
			return;
		this._snapPoints = snapPoints;
		this._initialProgress = currentProgress;
		this._progress_scale = Math.clamp(currentProgress, ...this._getBounds());
		this._ackState = GestureACKState.ACKED;
	}

	_reset() {
		this._historyTracker.reset();
		this._snapPoints = [];
		this._initialProgress = 0;
	}

	_interrupt() {
		if (this._ackState !== GestureACKState.ACKED)
			return;
		this._reset();
		this._ackState = GestureACKState.NONE;
		this.emit('end', 0, this._initialProgress);
	}

	_emitBegin() {
		if (this._ackState === GestureACKState.ACKED)
			return;
		this._historyTracker.reset();
		this._ackState = GestureACKState.PENDING_ACK;
		this._progress_scale = 1.0;
		this.emit('begin');
	}

	_emitUpdate(time, pinch_scale) {
		if (this._ackState !== GestureACKState.ACKED)
			return;

		// this._historyTracker.append(time, delta);
		// delta /= this._pinchDistance;
		const new_progress = Math.log2(pinch_scale) * this.PINCH_MULTIPLIER + this._initialProgress;
		const delta = new_progress - this._progress_scale;
		this._historyTracker.append(time, delta);
		this._progress_scale = Math.clamp(new_progress, ...this._getBounds());

		// log(JSON.stringify({ pinch_scale, new_progress, delta }));
		this.emit('update', this._progress_scale);
	}

	_emitEnd(time) {
		if (this._ackState !== GestureACKState.ACKED)
			return;
		this._historyTracker.trim(time);
		let velocity = this._historyTracker.calculateVelocity();
		const endProgress = this._getEndProgress(velocity);
		if ((endProgress - this._progress_scale) * velocity <= 0)
			velocity = ANIMATION_BASE_VELOCITY;
		let duration = Math.abs((this._progress_scale - endProgress) / velocity * DURATION_MULTIPLIER);
		duration = Math.clamp(duration, MIN_ANIMATION_DURATION, MAX_ANIMATION_DURATION);
		this._reset();
		this._ackState = GestureACKState.NONE;
		this.emit('end', duration, endProgress);
	}

	_findEndPoints() {
		const current = this._progress_scale;
		return {
			current,
			next: Math.clamp(Math.ceil(current), ...this._getBounds()),
			previous: Math.clamp(Math.floor(current), ...this._getBounds()),
		};
	}

	_findClosestPoint(pos) {
		const distances = this._snapPoints.map(x => Math.abs(x - pos));
		const min = Math.min(...distances);
		return distances.indexOf(min);
	}

	_findNextPoint(pos) {
		return this._snapPoints.findIndex(p => p >= pos);
	}

	_findPreviousPoint(pos) {
		const reversedIndex = this._snapPoints.slice().reverse().findIndex(p => p <= pos);
		return this._snapPoints.length - 1 - reversedIndex;
	}

	_findPointForProjection(pos, velocity) {
		const initial = this._findClosestPoint(this._initialProgress);
		const prev = this._findPreviousPoint(pos);
		const next = this._findNextPoint(pos);
		if ((velocity > 0 ? prev : next) === initial)
			return velocity > 0 ? next : prev;
		return this._findClosestPoint(pos);
	}

	_getEndProgress(velocity) {
		// if (Math.abs(velocity) < VELOCITY_THRESHOLD_TOUCHPAD)
		// 	return this._snapPoints[this._findClosestPoint(this._progress)];
		const slope = DECELERATION_TOUCHPAD / (1.0 - DECELERATION_TOUCHPAD) / 1000.0;
		let pos;
		if (Math.abs(velocity) > VELOCITY_CURVE_THRESHOLD) {
			const c = slope / 2 / DECELERATION_PARABOLA_MULTIPLIER;
			const x = Math.abs(velocity) - VELOCITY_CURVE_THRESHOLD + c;
			pos = slope * VELOCITY_CURVE_THRESHOLD +
                DECELERATION_PARABOLA_MULTIPLIER * x * x -
                DECELERATION_PARABOLA_MULTIPLIER * c * c;
		}
		else {
			pos = Math.abs(velocity) * slope;
		}

		pos = pos * Math.sign(velocity) + this._progress_scale;
		pos = Math.clamp(pos, ...this._getBounds());
		const index = this._findPointForProjection(pos, velocity);
		return this._snapPoints[index];
	}

	destroy() {
		if (this._stageCaptureEvent) {
			global.stage.disconnect(this._stageCaptureEvent);
			this._stageCaptureEvent = 0;
		}
	}
});
