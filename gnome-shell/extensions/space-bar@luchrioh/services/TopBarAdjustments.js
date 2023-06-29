const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Settings } = Me.imports.services.Settings;
const Main = imports.ui.main;
var TopBarAdjustments = class TopBarAdjustments {
    constructor() {
        this._settings = Settings.getInstance();
        this._didHideActivitiesButton = false;
    }
    static init() {
        TopBarAdjustments._instance = new TopBarAdjustments();
        TopBarAdjustments._instance.init();
    }
    static destroy() {
        TopBarAdjustments._instance.destroy();
        TopBarAdjustments._instance = null;
    }
    init() {
        this._settings.position.subscribe((value) => {
            if (value === 'left') {
                this._hideActivitiesButton();
            }
            else {
                this._restoreActivitiesButton();
            }
        }, { emitCurrentValue: true });
    }
    destroy() {
        this._restoreActivitiesButton();
    }
    _hideActivitiesButton() {
        const activitiesButton = Main.panel.statusArea['activities'];
        if (activitiesButton && !Main.sessionMode.isLocked && activitiesButton.is_visible()) {
            activitiesButton.hide();
            this._didHideActivitiesButton = true;
        }
    }
    _restoreActivitiesButton() {
        const activitiesButton = Main.panel.statusArea['activities'];
        if (activitiesButton && this._didHideActivitiesButton) {
            activitiesButton.show();
            this._didHideActivitiesButton = false;
        }
    }
}
