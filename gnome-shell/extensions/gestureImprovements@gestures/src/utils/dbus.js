/* exported subscribe, unsubscribeAll, drop_proxy */
const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { registerClass } = Me.imports.common.utils.gobject;
const { printStack } = Me.imports.common.utils.logging;
const Util = imports.misc.util;
const X11GestureDaemonXml = `<node>
	<interface name="org.gestureImprovements.gestures">
		<signal name="TouchpadSwipe">
			<arg name="event" type="(siddu)"/>
		</signal>
		<signal name="TouchpadHold">
			<arg name="event" type="(siub)"/>
		</signal>
		<signal name="TouchpadPinch">
			<arg name="event" type="(siddu)" />
	  	</signal>
	</interface>
</node>`;

const DBusWrapperGIExtension = registerClass({
	Signals: {
		'TouchpadSwipe': {
			param_types: [
				GObject.TYPE_STRING,
				GObject.TYPE_INT,
				GObject.TYPE_DOUBLE,
				GObject.TYPE_DOUBLE,
				GObject.TYPE_UINT
			],
			flags: GObject.SignalFlags.RUN_LAST,
			accumulator: GObject.AccumulatorType.TRUE_HANDLED,
			return_type: GObject.TYPE_BOOLEAN,
		},
		'TouchpadHold': {
			param_types: [
				GObject.TYPE_STRING,
				GObject.TYPE_INT,
				GObject.TYPE_UINT,
				GObject.TYPE_BOOLEAN
			],
			flags: GObject.SignalFlags.RUN_LAST,
			accumulator: GObject.AccumulatorType.TRUE_HANDLED,
			return_type: GObject.TYPE_BOOLEAN,
		},
		'TouchpadPinch': {
			param_types: [
				GObject.TYPE_STRING,
				GObject.TYPE_INT,
				GObject.TYPE_DOUBLE,
				GObject.TYPE_DOUBLE,
				GObject.TYPE_UINT
			],
			flags: GObject.SignalFlags.RUN_LAST,
			accumulator: GObject.AccumulatorType.TRUE_HANDLED,
			return_type: GObject.TYPE_BOOLEAN,
		},
	},
	Properties: {},
}, class DBusWrapperGIExtension extends GObject.Object {
	_init() {
		super._init();
		this._proxyConnectSignalIds = [];
		const ProxyClass = Gio.DBusProxy.makeProxyWrapper(X11GestureDaemonXml);
		this._proxy = new ProxyClass(Gio.DBus.session, 'org.gestureImprovements.gestures', '/org/gestureImprovements/gestures');
		this._proxyConnectSignalIds.push(this._proxy.connectSignal('TouchpadSwipe', this._handleDbusSwipeSignal.bind(this)));
		this._proxyConnectSignalIds.push(this._proxy.connectSignal('TouchpadHold', this._handleDbusHoldSignal.bind(this)));
		this._proxyConnectSignalIds.push(this._proxy.connectSignal('TouchpadPinch', this._handleDbusPinchSignal.bind(this)));
	}

	dropProxy() {
		if (this._proxy) {
			this._proxyConnectSignalIds.forEach(id => this._proxy.disconnectSignal(id));
			this._proxy.run_dispose();
			this._proxy = undefined;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_handleDbusSwipeSignal(_proxy, _sender, params) {
		// (siddu)
		const [sphase, fingers, dx, dy, time] = params[0];
		this.emit('TouchpadSwipe', sphase, fingers, dx, dy, time);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_handleDbusHoldSignal(_proxy, _sender, params) {
		// (siub)
		const [sphase, fingers, time, cancelled] = params[0];
		this.emit('TouchpadHold', sphase, fingers, time, cancelled);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_handleDbusPinchSignal(_proxy, _sender, params) {
		// (siddu)
		const [sphase, fingers, angle_delta, scale, time] = params[0];
		this.emit('TouchpadPinch', sphase, fingers, angle_delta, scale, time);
	}
});

function GenerateEvent(typ, sphase, fingers, time, params) {
	return {
		type: () => typ,
		get_gesture_phase: () => {
			switch (sphase) {
				case 'Begin':
					return Clutter.TouchpadGesturePhase.BEGIN;
				case 'Update':
					return Clutter.TouchpadGesturePhase.UPDATE;
				default:
					return params.is_cancelled ? Clutter.TouchpadGesturePhase.CANCEL : Clutter.TouchpadGesturePhase.END;
			}
		},
		get_touchpad_gesture_finger_count: () => fingers,
		get_coords: () => global.get_pointer().slice(0, 2),
		get_gesture_motion_delta_unaccelerated: () => { var _a, _b; return [(_a = params.dx) !== null && _a !== void 0 ? _a : 0, (_b = params.dy) !== null && _b !== void 0 ? _b : 0]; },
		get_time: () => time,
		get_gesture_pinch_scale: () => { var _a; return (_a = params.pinch_scale) !== null && _a !== void 0 ? _a : 1.0; },
		get_gesture_pinch_angle_delta: () => { var _a; return (_a = params.pinch_angle_delta) !== null && _a !== void 0 ? _a : 0; },
	};
}

let proxy;
let connectedSignalIds = [];

function subscribe(callback) {
	if (!proxy) {
		printStack('starting dbus service \'gesture_improvements_gesture_daemon.service\' via spawn');
		Util.spawn(['systemctl', '--user', 'start', 'gesture_improvements_gesture_daemon.service']);
		connectedSignalIds = [];
		proxy = new DBusWrapperGIExtension();
	}

	connectedSignalIds.push(proxy.connect('TouchpadSwipe', (_source, sphase, fingers, dx, dy, time) => {
		const event = GenerateEvent(Clutter.EventType.TOUCHPAD_SWIPE, sphase, fingers, time, { dx, dy });
		return callback(undefined, event);
	}));

	connectedSignalIds.push(proxy.connect('TouchpadHold', (_source, sphase, fingers, time, is_cancelled) => {
		const event = GenerateEvent(Clutter.EventType.TOUCHPAD_HOLD, sphase, fingers, time, { is_cancelled });
		return callback(undefined, event);
	}));

	connectedSignalIds.push(proxy.connect('TouchpadPinch', (_source, sphase, fingers, pinch_angle_delta, pinch_scale, time) => {
		const event = GenerateEvent(Clutter.EventType.TOUCHPAD_PINCH, sphase, fingers, time, { pinch_angle_delta, pinch_scale });
		return callback(undefined, event);
	}));
}

function unsubscribeAll() {
	if (proxy) {
		connectedSignalIds.forEach(id => proxy === null || proxy === void 0 ? void 0 : proxy.disconnect(id));
		connectedSignalIds = [];
	}
}

function drop_proxy() {
	if (proxy) {
		unsubscribeAll();
		proxy.dropProxy();
		proxy.run_dispose();
		proxy = undefined;
		Util.spawn(['systemctl', '--user', 'stop', 'gesture_improvements_gesture_daemon.service']);
	}
}
