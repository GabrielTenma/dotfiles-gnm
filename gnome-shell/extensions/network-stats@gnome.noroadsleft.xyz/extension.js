'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { Logger } = Me.imports.utils.Logger;
const { App } = Me.imports.App;
const { initBrodcasters, deinitBrodcasters } = Me.imports.utils.Broadcasters;

function init() {
    Logger.info(`initializing ${Me.metadata.name}`);
    ExtensionUtils.initTranslations();
}

function enable() {
    Logger.info(`enabling ${Me.metadata.name}`);
    initBrodcasters();
    App.instance().start();
}

function disable() {
    Logger.info(`disabling ${Me.metadata.name}`);
    App.instance().stop();
    deinitBrodcasters();
    App.deleteInstance();
}
