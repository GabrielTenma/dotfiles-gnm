const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { Gio } = imports.gi;
var Settings = class Settings {
    constructor() {
        this.state = ExtensionUtils.getSettings(`${Me.metadata['settings-schema']}.state`);
        this.behaviorSettings = ExtensionUtils.getSettings(`${Me.metadata['settings-schema']}.behavior`);
        this.appearanceSettings = ExtensionUtils.getSettings(`${Me.metadata['settings-schema']}.appearance`);
        this.shortcutsSettings = ExtensionUtils.getSettings(`${Me.metadata['settings-schema']}.shortcuts`);
        this.mutterSettings = new Gio.Settings({ schema: 'org.gnome.mutter' });
        this.wmPreferencesSettings = new Gio.Settings({
            schema: 'org.gnome.desktop.wm.preferences',
        });
        this.workspaceNamesMap = SettingsSubject.createJsonObjectSubject(this.state, 'workspace-names-map');
        this.dynamicWorkspaces = SettingsSubject.createBooleanSubject(this.mutterSettings, 'dynamic-workspaces');
        this.showEmptyWorkspaces = SettingsSubject.createBooleanSubject(this.behaviorSettings, 'show-empty-workspaces');
        this.overviewOnEmptyWorkspace = SettingsSubject.createBooleanSubject(this.behaviorSettings, 'overview-on-empty-workspace');
        this.scrollWheel = SettingsSubject.createStringSubject(this.behaviorSettings, 'scroll-wheel');
        this.scrollWheelDebounce = SettingsSubject.createBooleanSubject(this.behaviorSettings, 'scroll-wheel-debounce');
        this.scrollWheelDebounceTime = SettingsSubject.createIntSubject(this.behaviorSettings, 'scroll-wheel-debounce-time');
        this.smartWorkspaceNames = SettingsSubject.createBooleanSubject(this.behaviorSettings, 'smart-workspace-names');
        this.position = SettingsSubject.createStringSubject(this.behaviorSettings, 'position');
        this.positionIndex = SettingsSubject.createIntSubject(this.behaviorSettings, 'position-index');
        this.enableActivateWorkspaceShortcuts = SettingsSubject.createBooleanSubject(this.shortcutsSettings, 'enable-activate-workspace-shortcuts');
        this.enableMoveToWorkspaceShortcuts = SettingsSubject.createBooleanSubject(this.shortcutsSettings, 'enable-move-to-workspace-shortcuts');
        this.workspaceNames = SettingsSubject.createStringArraySubject(this.wmPreferencesSettings, 'workspace-names');
        this.workspacesBarPadding = SettingsSubject.createIntSubject(this.appearanceSettings, 'workspaces-bar-padding');
        this.workspaceMargin = SettingsSubject.createIntSubject(this.appearanceSettings, 'workspace-margin');
        this.activeWorkspaceBackgroundColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'active-workspace-background-color');
        this.activeWorkspaceTextColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'active-workspace-text-color');
        this.activeWorkspaceBorderColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'active-workspace-border-color');
        this.activeWorkspaceFontWeight = SettingsSubject.createStringSubject(this.appearanceSettings, 'active-workspace-font-weight');
        this.activeWorkspaceBorderRadius = SettingsSubject.createIntSubject(this.appearanceSettings, 'active-workspace-border-radius');
        this.activeWorkspaceBorderWidth = SettingsSubject.createIntSubject(this.appearanceSettings, 'active-workspace-border-width');
        this.activeWorkspacePaddingH = SettingsSubject.createIntSubject(this.appearanceSettings, 'active-workspace-padding-h');
        this.activeWorkspacePaddingV = SettingsSubject.createIntSubject(this.appearanceSettings, 'active-workspace-padding-v');
        this.inactiveWorkspaceBackgroundColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'inactive-workspace-background-color');
        this.inactiveWorkspaceTextColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'inactive-workspace-text-color');
        this.inactiveWorkspaceBorderColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'inactive-workspace-border-color');
        this.inactiveWorkspaceFontWeight = SettingsSubject.createStringSubject(this.appearanceSettings, 'inactive-workspace-font-weight');
        this.inactiveWorkspaceBorderRadius = SettingsSubject.createIntSubject(this.appearanceSettings, 'inactive-workspace-border-radius');
        this.inactiveWorkspaceBorderWidth = SettingsSubject.createIntSubject(this.appearanceSettings, 'inactive-workspace-border-width');
        this.inactiveWorkspacePaddingH = SettingsSubject.createIntSubject(this.appearanceSettings, 'inactive-workspace-padding-h');
        this.inactiveWorkspacePaddingV = SettingsSubject.createIntSubject(this.appearanceSettings, 'inactive-workspace-padding-v');
        this.emptyWorkspaceBackgroundColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'empty-workspace-background-color');
        this.emptyWorkspaceTextColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'empty-workspace-text-color');
        this.emptyWorkspaceBorderColor = SettingsSubject.createStringSubject(this.appearanceSettings, 'empty-workspace-border-color');
        this.emptyWorkspaceFontWeight = SettingsSubject.createStringSubject(this.appearanceSettings, 'empty-workspace-font-weight');
        this.emptyWorkspaceBorderRadius = SettingsSubject.createIntSubject(this.appearanceSettings, 'empty-workspace-border-radius');
        this.emptyWorkspaceBorderWidth = SettingsSubject.createIntSubject(this.appearanceSettings, 'empty-workspace-border-width');
        this.emptyWorkspacePaddingH = SettingsSubject.createIntSubject(this.appearanceSettings, 'empty-workspace-padding-h');
        this.emptyWorkspacePaddingV = SettingsSubject.createIntSubject(this.appearanceSettings, 'empty-workspace-padding-v');
    }
    static init() {
        Settings._instance = new Settings();
        Settings._instance.init();
    }
    static destroy() {
        Settings._instance?.destroy();
        Settings._instance = null;
    }
    static getInstance() {
        return Settings._instance;
    }
    init() {
        SettingsSubject.initAll();
    }
    destroy() {
        SettingsSubject.destroyAll();
    }
}
class SettingsSubject {
    constructor(_settings, _name, _type) {
        this._settings = _settings;
        this._name = _name;
        this._type = _type;
        this._subscribers = [];
        SettingsSubject._subjects.push(this);
    }
    static createBooleanSubject(settings, name) {
        return new SettingsSubject(settings, name, 'boolean');
    }
    static createIntSubject(settings, name) {
        return new SettingsSubject(settings, name, 'int');
    }
    static createStringSubject(settings, name) {
        return new SettingsSubject(settings, name, 'string');
    }
    static createStringArraySubject(settings, name) {
        return new SettingsSubject(settings, name, 'string-array');
    }
    static createJsonObjectSubject(settings, name) {
        return new SettingsSubject(settings, name, 'json-object');
    }
    static initAll() {
        for (const subject of SettingsSubject._subjects) {
            subject._init();
        }
    }
    static destroyAll() {
        for (const subject of SettingsSubject._subjects) {
            subject._destroy();
        }
        SettingsSubject._subjects = [];
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._setValue(value);
    }
    subscribe(subscriber, { emitCurrentValue = false } = {}) {
        this._subscribers.push(subscriber);
        if (emitCurrentValue) {
            subscriber(this._value);
        }
    }
    _init() {
        this._getValue = () => {
            switch (this._type) {
                case 'boolean':
                    return this._settings.get_boolean(this._name);
                case 'int':
                    return this._settings.get_int(this._name);
                case 'string':
                    return this._settings.get_string(this._name);
                case 'string-array':
                    return this._settings.get_strv(this._name);
                case 'json-object':
                    return JSON.parse(this._settings.get_string(this._name));
                default:
                    throw new Error('unknown type ' + this._type);
            }
        };
        this._setValue = (value) => {
            switch (this._type) {
                case 'boolean':
                    return this._settings.set_boolean(this._name, value);
                case 'int':
                    return this._settings.set_int(this._name, value);
                case 'string':
                    return this._settings.set_string(this._name, value);
                case 'string-array':
                    return this._settings.set_strv(this._name, value);
                case 'json-object':
                    return this._settings.set_string(this._name, JSON.stringify(value));
                default:
                    throw new Error('unknown type ' + this._type);
            }
        };
        this._value = this._getValue();
        const changed = this._settings.connect(`changed::${this._name}`, () => this._updateValue(this._getValue()));
        this._disconnect = () => this._settings.disconnect(changed);
    }
    _destroy() {
        this._disconnect();
        this._subscribers = [];
    }
    _updateValue(value) {
        this._value = value;
        this._notifySubscriber();
    }
    _notifySubscriber() {
        for (const subscriber of this._subscribers) {
            subscriber(this._value);
        }
    }
}
SettingsSubject._subjects = [];
