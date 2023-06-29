const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { EventBroadcaster } = Me.imports.utils.EventBroadcaster;

var deviceResetMessageBroadcaster;
var titleClickedMessageBroadcaster;

function initBrodcasters() {
    if (!deviceResetMessageBroadcaster) {
        deviceResetMessageBroadcaster = new EventBroadcaster();
    }
    if (!titleClickedMessageBroadcaster) {
        titleClickedMessageBroadcaster = new EventBroadcaster();
    }
}

function deinitBrodcasters() {
    if (deviceResetMessageBroadcaster) {
        deviceResetMessageBroadcaster = undefined;
    }
    if (titleClickedMessageBroadcaster) {
        titleClickedMessageBroadcaster = undefined;
    }
}

function getDeviceResetMessageBroadcaster() {
    return deviceResetMessageBroadcaster;
}

function getTitleClickedMessageBroadcaster() {
    return titleClickedMessageBroadcaster;
}
