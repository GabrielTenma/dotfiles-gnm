const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { DeviceType } = Me.imports.utils.Constants;
const { TypeUtils } = Me.imports.utils.TypeUtils;


/**
 * Compares 2 POJO for equality
 * @param {any} obj1
 * @param {any} obj2
 * @returns - if objects/values are eaual returns true otherwise false
 */
function areEqual(obj1, obj2) {
    if (TypeUtils.isObject(obj1) && TypeUtils.isObject(obj2)) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length === keys2.length) {
            for (let key of keys1) {
                if (!areEqual(obj1[key], obj2[key])) {
                    return false;
                }
            }
            return true;
        }
    } else if (TypeUtils.isArray(obj1) && TypeUtils.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            for (let index in obj1) {
                if (areEqual(obj1[index], obj2[index])) {
                    return false;
                }
            }
        }
        return true;
    }
    return obj1 === obj2;
}


/**
 * Compares to json string for equality
 * @param {string} str1
 * @param {string} str2
 * @returns - true if they are equal otherwise false.
 */
function compareJsonStrings(str1, str2) {
    try {
        const obj1 = JSON.parse(str1);
        const obj2 = JSON.parse(str2);
        return areEqual(obj1, obj2);
    } catch(err) {
        // do nothing
    }
    return false;
}


/**
 * converts data bytes to string representation of data speed.
 * @param {number} amount
 * @param {boolean} mode  false - bits mode,  true - bytes mode
 * @returns - string representation of data speed
 */
function bytesSpeedToString(amount, mode = true) {

    let unitsMap;
    if (mode == false) {
        unitsMap = ["b/s", "Kb/s", "Mb/s", "Gb/s", "Tb/s"];
    } else {
        unitsMap = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];
    }

    if (amount === 0) {
        return `0.00 ${unitsMap[0]}`;
    }

    let base = 1024;
    if (mode == false) {
        base = 1000;
        amount = amount * 8;
    }

    let unitIndex = 0;
    while (amount >= 1000) {
        amount /= base;
        ++unitIndex;
    }

    let digits = 2;
    if (amount >= 100)
        digits = 0;
    else if (amount >= 10)
        digits = 1;

    return `${amount.toFixed(digits)} ${unitsMap[unitIndex]}`;
}


/**
 * converts data bytes to human readable string representation.
 * @param {number} bytes
 * @returns data size human readable units
 */
function bytesToString(bytes) {

    const unitsMap = ["B", "KB", "MB", "GB", "TB"];
    if (!bytes || bytes === 0) {
        return `0.00 ${unitsMap[0]}`;
    }

    let unitIndex = 0;
    while (bytes >= 1000) {
        bytes /= 1024;
        ++unitIndex;
    }

    let digits = 2;
    if (bytes >= 100)
        digits = 0;
    else if (bytes >= 10)
        digits = 1;

    return `${bytes.toFixed(digits)} ${unitsMap[unitIndex]}`;
}


/**
 * returns the icon relative path for given name
 * @param {string} name
 * @returns icon relative path.
 */
function getIconPath(name) {
    const currDir = Me.dir.get_path();
    return `${currDir}/assets/${name}`;
}


/**
 * Lookup and returns icon path for given deviceType
 * @param {string} deviceType
 * @returns icon relative path
 */
function getDeviceIcon(deviceType) {
    let path = "";
    switch(deviceType) {
        case DeviceType.ETHERNET:
            path = getIconPath("ethernet_black_24dp.svg");
            break;
        case DeviceType.WIFI:
            path = getIconPath("wifi_black_24dp.svg");
            break;
        case DeviceType.BLETOOTH:
            path = getIconPath("bluetooth_black_24dp.svg");
            break;
        case DeviceType.MODEM:
            path = getIconPath("modem_black_24dp.svg");
            break;
        default:
            path = getIconPath("device_hub_black_24dp.svg");
            break;
    }
    return path;
}

