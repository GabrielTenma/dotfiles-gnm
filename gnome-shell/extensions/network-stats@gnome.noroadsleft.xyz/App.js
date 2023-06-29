const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { AppController } = Me.imports.AppController;
const { AppSettingsModel } = Me.imports.AppSettingsModel;
const { DeviceModel } = Me.imports.net.DeviceModel;
const { NetworkMonitor } = Me.imports.net.NetworkMonitor;
const { DeviceMonitor } = Me.imports.net.DeviceMonitor;
const { Logger } = Me.imports.utils.Logger;

class AppClass {
    static instance() {
        return this._instance || (this._instance = new this());
    }

    static deleteInstance() {
        this._instance = undefined;
    }

    constructor() {
        const logger = new Logger();
        const appSettingsModel = new AppSettingsModel(logger);
        appSettingsModel.init();
        const deviceMonitor = new DeviceMonitor(logger);
        const networkMonitor = new NetworkMonitor(logger);
        const deviceModel = new DeviceModel(logger, deviceMonitor, networkMonitor, appSettingsModel);
        this._appController = new AppController(logger, appSettingsModel, deviceModel);
    }

    start() {
        this._appController.init();
        this._appController.show();
    }

    stop() {
        this._appController.hide();
        this._appController.deinit();
    }
}

var App = AppClass;