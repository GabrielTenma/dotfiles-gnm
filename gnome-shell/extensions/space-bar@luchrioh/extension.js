const Me = imports.misc.extensionUtils.getCurrentExtension();
const { KeyBindings } = Me.imports.services.KeyBindings;
const { ScrollHandler } = Me.imports.services.ScrollHandler;
const { Settings } = Me.imports.services.Settings;
const { Styles } = Me.imports.services.Styles;
const { TopBarAdjustments } = Me.imports.services.TopBarAdjustments;
const { Workspaces } = Me.imports.services.Workspaces;
const { WorkspacesBar } = Me.imports.ui.WorkspacesBar;
class Extension {
    constructor() {
        this.workspacesBar = null;
        this.scrollHandler = null;
    }
    enable() {
        Settings.init();
        TopBarAdjustments.init();
        Workspaces.init();
        KeyBindings.init();
        Styles.init();
        this.workspacesBar = new WorkspacesBar();
        this.workspacesBar.init();
        this.scrollHandler = new ScrollHandler();
        this.scrollHandler.init(this.workspacesBar.getWidget());
    }
    disable() {
        Settings.destroy();
        TopBarAdjustments.destroy();
        Workspaces.destroy();
        KeyBindings.destroy();
        Styles.destroy();
        this.scrollHandler?.destroy();
        this.scrollHandler = null;
        this.workspacesBar?.destroy();
        this.workspacesBar = null;
    }
}
function init() {
    return new Extension();
}
