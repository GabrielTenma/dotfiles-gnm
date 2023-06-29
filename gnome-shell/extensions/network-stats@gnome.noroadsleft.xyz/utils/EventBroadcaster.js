
/*
* EventBroadcaster class can be inherited to create a new type of event broadcaster.
*/

class EventBroadcasterClass {
    
    constructor() {
        this._listeners = [];
    }

    subscribe(listener) {
        if (-1 == this._listeners.indexOf(listener)) {
            this._listeners.push(listener);
        }
        return listener;
    }

    unsubscribe(listener) {
        const index = this._listeners.indexOf(listener);
        if (index != -1) {
            this._listeners.splice(index, 1);
        }
        return listener;
    }
    
    broadcast(message) {
        for (const listener of this._listeners) {
            listener(message);
        }
    }
}
var EventBroadcaster = EventBroadcasterClass;