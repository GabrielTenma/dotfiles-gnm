const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { Adw } = imports.gi;
const { addColorButton, addCombo, addSpinButton } = Me.imports.preferences.common;
var fontWeightOptions = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Normal',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black',
};
var AppearancePage = class AppearancePage {
    constructor() {
        this.page = new Adw.PreferencesPage();
        this._settings = ExtensionUtils.getSettings(`${Me.metadata['settings-schema']}.appearance`);
    }
    init() {
        this.page.set_title('_Appearance');
        this.page.use_underline = true;
        this.page.set_icon_name('applications-graphics-symbolic');
        this._initGeneralGroup();
        this._initActiveWorkspaceGroup();
        this._initInactiveWorkspaceGroup();
        this._initEmptyWorkspaceGroup();
    }
    _initGeneralGroup() {
        const group = new Adw.PreferencesGroup();
        group.set_title('General');
        addSpinButton({
            settings: this._settings,
            group,
            key: 'workspaces-bar-padding',
            title: 'Workspaces-bar padding',
            lower: 0,
            upper: 255,
        }).addResetButton({ window: this.window });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'workspace-margin',
            title: 'Workspace margin',
            lower: 0,
            upper: 255,
        }).addResetButton({ window: this.window });
        this.page.add(group);
    }
    _initActiveWorkspaceGroup() {
        const group = new Adw.PreferencesGroup();
        group.set_title('Active Workspace');
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'active-workspace-background-color',
            title: 'Background color',
        }).addResetButton({ window: this.window });
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'active-workspace-text-color',
            title: 'Text color',
        }).addResetButton({ window: this.window });
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'active-workspace-border-color',
            title: 'Border color',
        }).addResetButton({ window: this.window });
        addCombo({
            window: this.window,
            settings: this._settings,
            group,
            key: 'active-workspace-font-weight',
            title: 'Font weight',
            options: fontWeightOptions,
        }).addResetButton({ window: this.window });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'active-workspace-border-radius',
            title: 'Border radius',
            lower: 0,
            upper: 255,
        }).addResetButton({ window: this.window });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'active-workspace-border-width',
            title: 'Border width',
            lower: 0,
            upper: 255,
        }).addResetButton({ window: this.window });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'active-workspace-padding-h',
            title: 'Horizontal padding',
            lower: 0,
            upper: 255,
        }).addResetButton({ window: this.window });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'active-workspace-padding-v',
            title: 'Vertical padding',
            lower: 0,
            upper: 255,
        }).addResetButton({ window: this.window });
        this.page.add(group);
    }
    _initInactiveWorkspaceGroup() {
        const group = new Adw.PreferencesGroup();
        group.set_title('Inactive Workspace');
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'inactive-workspace-background-color',
            title: 'Background color',
        }).addResetButton({ window: this.window });
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'inactive-workspace-text-color',
            title: 'Text color',
        }).addResetButton({ window: this.window });
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'inactive-workspace-border-color',
            title: 'Border color',
        }).addResetButton({ window: this.window });
        addCombo({
            window: this.window,
            settings: this._settings,
            group,
            key: 'inactive-workspace-font-weight',
            title: 'Font weight',
            options: fontWeightOptions,
        }).linkValue({
            window: this.window,
            linkedKey: 'active-workspace-font-weight',
        });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'inactive-workspace-border-radius',
            title: 'Border radius',
            lower: 0,
            upper: 255,
        }).linkValue({
            window: this.window,
            linkedKey: 'active-workspace-border-radius',
        });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'inactive-workspace-border-width',
            title: 'Border width',
            lower: 0,
            upper: 255,
        }).linkValue({
            window: this.window,
            linkedKey: 'active-workspace-border-width',
        });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'inactive-workspace-padding-h',
            title: 'Horizontal padding',
            lower: 0,
            upper: 255,
        }).linkValue({
            window: this.window,
            linkedKey: 'active-workspace-padding-h',
        });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'inactive-workspace-padding-v',
            title: 'Vertical padding',
            lower: 0,
            upper: 255,
        }).linkValue({
            window: this.window,
            linkedKey: 'active-workspace-padding-v',
        });
        this.page.add(group);
    }
    _initEmptyWorkspaceGroup() {
        const group = new Adw.PreferencesGroup();
        group.set_title('Empty Workspace');
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'empty-workspace-background-color',
            title: 'Background color',
        }).addResetButton({ window: this.window });
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'empty-workspace-text-color',
            title: 'Text color',
        }).addResetButton({ window: this.window });
        addColorButton({
            window: this.window,
            settings: this._settings,
            group,
            key: 'empty-workspace-border-color',
            title: 'Border color',
        }).addResetButton({ window: this.window });
        addCombo({
            window: this.window,
            settings: this._settings,
            group,
            key: 'empty-workspace-font-weight',
            title: 'Font weight',
            options: fontWeightOptions,
        }).linkValue({
            window: this.window,
            linkedKey: 'inactive-workspace-font-weight',
        });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'empty-workspace-border-radius',
            title: 'Border radius',
            lower: 0,
            upper: 255,
        }).linkValue({
            window: this.window,
            linkedKey: 'inactive-workspace-border-radius',
        });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'empty-workspace-border-width',
            title: 'Border width',
            lower: 0,
            upper: 255,
        }).linkValue({
            window: this.window,
            linkedKey: 'inactive-workspace-border-width',
        });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'empty-workspace-padding-h',
            title: 'Horizontal padding',
            lower: 0,
            upper: 255,
        }).linkValue({
            window: this.window,
            linkedKey: 'inactive-workspace-padding-h',
        });
        addSpinButton({
            settings: this._settings,
            group,
            key: 'empty-workspace-padding-v',
            title: 'Vertical padding',
            lower: 0,
            upper: 255,
        }).linkValue({
            window: this.window,
            linkedKey: 'inactive-workspace-padding-v',
        });
        this.page.add(group);
    }
}
