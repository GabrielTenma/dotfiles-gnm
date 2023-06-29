const { GLib } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { NetworkMonitor } = Me.imports.net.NetworkMonitor;
const { DeviceMonitor } = Me.imports.net.DeviceMonitor;
const { bytesSpeedToString } = Me.imports.utils.GenUtils;
const { bytesToString } = Me.imports.utils.GenUtils;
const { getDeviceResetMessageBroadcaster } = Me.imports.utils.Broadcasters;


/*
* Device model class responsible collecting network stats for all the network interfaces and stores them.
* Device model is used by AppController and UI for fetching the stats details.
*/

class DeviceModelClass {

    constructor(logger, deviceMonitor, networkMonitor, appSettingsModel) {
        this._stats = {};
        this._statsText = {};
        this._lastTime = undefined;
        this._logger = logger;
        this._deviceMonitor = deviceMonitor;
        this._networkMonitor = networkMonitor;
        this._appSettingsModel = appSettingsModel;
        this.init();
    }

    get networkMonitor() {
        return this._networkMonitor;
    }

    get deviceMonitor() {
        return this._deviceMonitor;
    }

    init() {
        const now = new Date();
        const {devicesInfoMap} = this._appSettingsModel;
        const stats = {};
        for (const [name, deviceInfo] of Object.entries(devicesInfoMap)) {
            const {
                resetedAt,
                totalUpload = 0,
                totalDownload = 0,
            } = deviceInfo;
            const totalData = totalUpload + totalDownload;
            this._logger.info(`init - ${name} - ${resetedAt}`);
            stats[name] = {
                name,
                totalUpload,
                totalDownload,
                totalData
            };
            if (resetedAt) {
                stats[name].resetedAt = new Date(resetedAt) || now;
            } else {
                stats[name].resetedAt = now;
            }
            this._stats = stats;
        }
        getDeviceResetMessageBroadcaster().subscribe(this.resetDeviceStats.bind(this));
    }

    getStats() {
        return this._stats;
    }

    getReadableStats() {
        return this._statsText;
    }

    getStatField(deviceName, field, defaultVal) {
        const stat =  this._stats[deviceName];
        if (stat) {
            return stat[field] || defaultVal;
        }
        return defaultVal;
    }

    getStatTextField(deviceName, field, defaultVal) {
        const stat =  this._statsText[deviceName];
        if (stat) {
            return stat[field] || defaultVal;
        }
        return defaultVal;
    }

    /** values in bytes */
    getUploadSpeed(deviceName) {
        return this.getStatField(deviceName, "upSpeed", 0);
    }

    getDownloadSpeed(deviceName) {
        return this.getStatField(deviceName, "downSpeed", 0);
    }

    getTotalSpeed(deviceName) {
        return this.getStatField(deviceName, "totalSpeed", 0);
    }

    getTotalDataUsage(deviceName) {
        return this.getStatTextField(deviceName, "totalData", "");
    }

    /** Human readable string format */
    getUploadSpeedText(deviceName) {
        return this.getStatTextField(deviceName, "upSpeed", "");
    }

    getDownloadSpeedText(deviceName) {
        return this.getStatTextField(deviceName, "downSpeed", "");
    }

    getTotalSpeedText(deviceName) {
        return this.getStatTextField(deviceName, "totalSpeed", "");
    }

    getTotalDataUsageText(deviceName) {
        return this.getStatTextField(deviceName, "totalData", "");
    }

    /** Device methods */
    hasDevice(deviceName) {
        return this._deviceMonitor.hasDevice(deviceName);
    }

    getActiveDeviceName() {
        return this._deviceMonitor.getActiveDeviceName();
    }

    getDevices() {
        return this._deviceMonitor.getDevices();
    }

    /** Return time delta in milliseconds */
    getTimeDelta() {
        const newTime = GLib.get_monotonic_time() / 1000;
        const timeDelta = newTime - (this._lastTime || newTime) + 1;
        this._lastTime = newTime;
        return timeDelta;
    }

    /* time in seconds */
    update(bytesMode = true) {
        const {
            error,
            deviceLogs
        } = this._networkMonitor.getStats();
        const timeDelta = this.getTimeDelta() / 1000;

        if (!error) {
            const stats = {};
            const statsText = {};
            for (const [name, deviceLog] of Object.entries(deviceLogs)) {
                const {
                    upload,
                    download
                } = deviceLog;

                if (!this._stats[name]) {
                    //new device detected
                    this.initDeviceStats(name);
                }

                const {
                    ["upload"]: oldUpload = upload,
                    ["download"]: oldDownload = download,
                    ["totalUpload"]: oldTotalUpload = 0,
                    ["totalDownload"]: oldTotalDownload = 0,
                    resetedAt
                } = this._stats[name];

                // delta
                const upDelta = upload - oldUpload;
                const downDelta = download - oldDownload;

                // speeds
                const upSpeed = upDelta / (timeDelta);
                const downSpeed = downDelta / (timeDelta);
                const totalSpeed = upSpeed + downSpeed;

                // total data till now
                const totalUpload = oldTotalUpload + upDelta;
                const totalDownload = oldTotalDownload + downDelta;
                const totalData = totalUpload + totalDownload;

                const device = this._deviceMonitor.getDeviceByName(name);
                if (device) {
                    const { ip, type } = device;
                    stats[name] = {
                        name,
                        ip,
                        type,
                        upload,
                        download,
                        upSpeed,
                        downSpeed,
                        totalSpeed,
                        totalUpload,
                        totalDownload,
                        resetedAt,
                    };

                    statsText[name] = {
                        name,
                        ip: ip,
                        type: type,
                        upSpeed: bytesSpeedToString(upSpeed, bytesMode),
                        downSpeed: bytesSpeedToString(downSpeed, bytesMode),
                        totalSpeed: bytesSpeedToString(totalSpeed, bytesMode),
                        totalData: bytesToString(totalData),
                        startTime: resetedAt.toLocaleString(undefined, {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour12: true,
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                        }),
                    };
                    //this._logger.debug(`${name} => upload: ${upSpeed} download: ${downSpeed} total: ${totalData}`);
                }
            }
            this._stats = stats;
            this._statsText = statsText;
        } else {
            this._logger.debug(error);
        }
    }

    saveStats() {
        const devicesInfo = { ...this._appSettingsModel.devicesInfoMap };
        const deviceLogs = this.getStats();
        for (const [name, stat] of Object.entries(deviceLogs)) {
            devicesInfo[name].totalUpload = stat.totalUpload;
            devicesInfo[name].totalDownload = stat.totalDownload;
        }
        this._appSettingsModel.devicesInfoMap = devicesInfo;
    }

    initDeviceStats(name) {
        this._logger.info(`New device added: ${name}`);
        const now = new Date();
        const stat = {
            totalUpload: 0,
            totalDownload: 0,
            resetedAt: now
        };
        this._stats[name] = stat;
        const deviceLogs = {
            totalUpload: 0,
            totalDownload: 0,
            resetedAt: now.toString()
        };
        this._appSettingsModel.replaceDeviceInfo(name, deviceLogs);
    }

    resetDeviceStats({name}) {
        const now = new Date();
        this._logger.info(`Resetting the device ${name} at ${now.toString()}`);
        if (this._stats[name]) {
            this._stats[name] = {
                ...this._stats[name],
                resetedAt: now,
                totalUpload: 0,
                totalDownload: 0
            };
            let deviceLogs = this._appSettingsModel.getDeviceInfo(name);
            deviceLogs = {
                ...deviceLogs,
                totalUpload: 0,
                totalDownload: 0,
                resetedAt: now.toString()
            };
            this._appSettingsModel.replaceDeviceInfo(name, deviceLogs);
        }
    }

    resetAll() {
        const now = new Date();
        const nowStr = now.toString();
        this._logger.info(`Restting all devices at ${nowStr}`);
        const infoMap = this._appSettingsModel.devicesInfoMap;
        for (const name in this._stats) {
            this._stats[name] = {
                ...this._stats[name],
                resetedAt: now,
                totalDownload: 0,
                totalUpload: 0,
            };
            infoMap[name] = {
                ...infoMap[name],
                resetedAt: nowStr,
                totalDownload: 0,
                totalUpload: 0
            }
        }
        this._appSettingsModel.devicesInfoMap = infoMap;
    }
}

var DeviceModel = DeviceModelClass;