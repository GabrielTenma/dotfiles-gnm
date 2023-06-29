const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { AppView } = Me.imports.ui.AppView;
const { DeviceModel } = Me.imports.net.DeviceModel;

const { DisplayMode } = Me.imports.utils.Constants;
const { bytesSpeedToString } = Me.imports.utils.GenUtils;
const { bytesToString } = Me.imports.utils.GenUtils;
const { getNextResetTime } = Me.imports.utils.DateTimeUtils;
const { getTitleClickedMessageBroadcaster } = Me.imports.utils.Broadcasters;

const kOneMinuteInMilliSeconds = 60 * 1000;

/*
* AppControlller class responsible for running timers,
* refreshing view and pushing model updates to UI.
*/

class AppControllerClass {

    constructor(logger, appSettingsModel, deviceModel) {
        this._logger = logger;
        this._appSettingsModel = appSettingsModel;
        this._deviceModel = deviceModel;
        this._appView = new AppView(logger, appSettingsModel);
        this._refreshTimeout = undefined;
        this._minuteTimeout = undefined;
        this._rightClickSubscribeHandle = undefined;
        this._settingsSubscribeHandle = undefined;
    }

    init() {
        // TODO: remove update() call from here and move device reset time to DeviceMonitor.
        this.update();
        this.resetIfRequired();
        this._rightClickSubscribeHandle = this.onRightClick.bind(this);
        getTitleClickedMessageBroadcaster().subscribe(this._rightClickSubscribeHandle);
        this._settingsSubscribeHandle = this.onSettingChanged.bind(this);
        this._appSettingsModel.subscribe(this._settingsSubscribeHandle);
        this.installTimers();
    }

    deinit() {
        getTitleClickedMessageBroadcaster().unsubscribe(this._rightClickSubscribeHandle);
        this._rightClickSubscribeHandle = undefined;
        this._appSettingsModel.unsubscribe(this._settingsSubscribeHandle);
        this._settingsSubscribeHandle = undefined;
        this._deviceModel.saveStats();
        this._appSettingsModel.deinit();
        this.uninstallTimers();
    }

    installTimers() {
        const { refreshInterval } = this._appSettingsModel;
        this._refreshTimeout = Mainloop.timeout_add(refreshInterval, this.onRefreshTimeout.bind(this));
        this._minuteTimeout = Mainloop.timeout_add(kOneMinuteInMilliSeconds, this.onEveryMinute.bind(this));
    }

    uninstallTimers() {
        if (this._refreshTimeout) {
            Mainloop.source_remove(this._refreshTimeout);
            this._refreshTimeout = undefined;
        }
        if (this._minuteTimeout) {
            Mainloop.source_remove(this._minuteTimeout);
            this._minuteTimeout = undefined;
        }
    }

    show() {
        this._appView.show();
    }

    hide() {
        this._appView.hide();
    }

    _getActiveDeviceName() {
        const userPreferedDevice = this._appSettingsModel.preferedDeviceName;
        if (this._deviceModel.hasDevice(userPreferedDevice)) {
            return userPreferedDevice;
        }
        return this._deviceModel.getActiveDeviceName();
    }

    update() {
        const { displayMode, displayBytes } = this._appSettingsModel;
        //this._logger.debug(`displayMode : ${displayMode}`);
        this._deviceModel.update(displayBytes);
        const activeDevice = this._getActiveDeviceName();
        //this._logger.debug(`activeDevice: ${activeDevice}`);
        let titleStr = "----";
        switch(displayMode) {
            case DisplayMode.TOTAL_SPEED:
            {
                const totalSpeedStr = this._deviceModel.getTotalSpeedText(activeDevice);
                titleStr = `↕ ${totalSpeedStr}`;
                break;
            }
            case DisplayMode.DOWNLOAD_SPEED:
            {
                const downloadStr = this._deviceModel.getDownloadSpeedText(activeDevice);
                titleStr = `↓ ${downloadStr}`;
                break;
            }
            case DisplayMode.UPLOAD_SPEED:
            {
                const uploadStr = this._deviceModel.getUploadSpeedText(activeDevice);
                titleStr = `↑ ${uploadStr}`;
                break;
            }
            case DisplayMode.BOTH_SPEED:
            {
                const downloadStr = this._deviceModel.getDownloadSpeedText(activeDevice);
                const uploadStr = this._deviceModel.getUploadSpeedText(activeDevice);
                titleStr = `↓ ${downloadStr} ↑ ${uploadStr}`;
                break;
            }
            case DisplayMode.TOTAL_DATA:
            {
                const totalDataStr = this._deviceModel.getTotalDataUsageText(activeDevice);
                titleStr = `Σ ${totalDataStr}`;
                break;
            }
        }
        this._appView.setTitleText(titleStr);
        this._appView.update(this._deviceModel);

        // Debugging
        // const upload = this._deviceModel.getUploadSpeed(activeDevice);
        // const download = this._deviceModel.getDownloadSpeed(activeDevice);
        // const totalData = this._deviceModel.getTotalDataUsage(activeDevice);
        // this._logger.debug(`upload: ${upload} download: ${download} totalData: ${totalData}`);
        // const uploadStr = bytesSpeedToString(upload, displayBytes);
        // const downloadStr = bytesSpeedToString(download, displayBytes);
        // const totalDataStr = bytesToString(totalData);
        // this._logger.debug(`deviceName: ${activeDevice} upload: ${uploadStr} download: ${downloadStr} totalData: ${totalDataStr}`);
    }

    resetIfRequired() {
        const now = new Date();
        const activeDevice = this._getActiveDeviceName();
        if (!activeDevice) {
            this._logger.error(`No active connection: ${activeDevice}! try reset next minute`);
            return;
        }
        const lastResetedAt = this._appSettingsModel.getLastResetDateTime(activeDevice);
        const newResetTime = getNextResetTime(lastResetedAt, this._appSettingsModel);
        //this._logger.log(`oldResetTime: ${lastResetedAt}`);
        //this._logger.log(`newResetTime: ${newResetTime}`);
        if (now.getTime() >= newResetTime.getTime()) {
            // crossed the mark, Time to reset network stats
            this._deviceModel.resetAll();
        }
    }

    // #region Event handlers
    onRefreshTimeout() {
        //this._logger.debug("tick");
        try {
            this.update();
        } catch(err) {
            this._logger.error(`ERROR: ${err.toString()} TRACE: ${err.stack}`);
        }
        return true;
    }

    onEveryMinute() {
        //this._logger.debug("every 1 minutes");
        try {
            this.resetIfRequired();
            this._deviceModel.saveStats();
        } catch(err) {
            this._logger.error(`ERROR: ${err.toString()} TRACE: ${err.stack}`);
        }
        return true;
    }

    onSettingChanged() {
        this.uninstallTimers();
        this.installTimers();
    }

    onRightClick({button}) {
        if (button === "right") {
            // cycle through the modes
            let { displayMode } = this._appSettingsModel;
            switch(displayMode) {
                default:
                case DisplayMode.TOTAL_SPEED:
                {
                    displayMode = DisplayMode.DOWNLOAD_SPEED;
                    break;
                }
                case DisplayMode.DOWNLOAD_SPEED:
                {
                    displayMode = DisplayMode.UPLOAD_SPEED;
                    break;
                }
                case DisplayMode.UPLOAD_SPEED:
                {
                    displayMode = DisplayMode.BOTH_SPEED;
                    break;
                }
                case DisplayMode.BOTH_SPEED:
                {
                    displayMode = DisplayMode.TOTAL_DATA;
                    break;
                }
                case DisplayMode.TOTAL_DATA:
                {
                    displayMode = DisplayMode.TOTAL_SPEED;
                    break;
                }
            }
            this._appSettingsModel.displayMode = displayMode;
            this.update();
        }
    }
    // #endregion Event handlers
}

var AppController = AppControllerClass;