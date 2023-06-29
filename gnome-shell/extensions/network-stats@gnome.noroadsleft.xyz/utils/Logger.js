'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


/*
* Utility class for logging.
*/

class LoggerClass {
    static instance() {
        return this._instance || (this._instance = new this());
    }

    static log(...args) {
        this.instance()._printLog("LOG", ...args);
    }

    static debug(...args) {
        this.instance()._printLog("DEBUG", ...args);
    }

    static info(...args) {
        this.instance()._printLog("INFO", ...args);
    }

    static error(...args) {
        this.instance()._printLog("ERROR", ...args);
    }

    static critical(...args) {
        this.instance()._printLog("**CRITICAL", ...args);
    }

    _callerInfo(level=3) {
        let stack = (new Error()).stack;
        let caller = stack.split("\n")[level];

        caller = caller.replace(Me.path + "/", "");

        let [code, line, _] = caller.split(":");
        let [func, file] = code.split(/\W*@/);

        return {
            line,
            func,
            file
        }
    }

    _printLog(tag, ...args) {
        const { line, func, file } = this._callerInfo();
        log(`${tag} ${file}::${func}(${line}) ${args}`);
    }

    log(...args) {
        this._printLog("LOG", ...args);
    }

    debug(...args) {
        this._printLog("DEBUG", ...args);
    }

    info(...args) {
        this._printLog("INFO", ...args);
    }

    error(...args) {
        this._printLog("ERROR", ...args);
    }

    critical(...args) {
        this._printLog("**CRITICAL", ...args);
    }
};

var Logger = LoggerClass;