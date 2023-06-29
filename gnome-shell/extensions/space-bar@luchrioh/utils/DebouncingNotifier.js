const Me = imports.misc.extensionUtils.getCurrentExtension();
const { GLib } = imports.gi;
/**
 * A subscribe/notify mechanism that debounces multiple subsequent notify calls.
 */
var DebouncingNotifier = class DebouncingNotifier {
    constructor(_delayMs = 0) {
        this._delayMs = _delayMs;
        this._subscribers = [];
        this._timeout = null;
    }
    notify() {
        if (this._timeout) {
            return;
        }
        this._timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, this._delayMs, () => {
            this._notify();
            this._timeout = null;
            return GLib.SOURCE_REMOVE;
        });
    }
    subscribe(callback) {
        this._subscribers.push(callback);
    }
    destroy() {
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }
        this._subscribers = [];
    }
    _notify() {
        for (const subscriber of this._subscribers) {
            subscriber();
        }
    }
}
