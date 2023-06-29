const { Atk, Clutter, St } = imports.gi;
const { GObject, Gio } = imports.gi;

const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const { CheckBox } = imports.ui.checkBox;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { getDeviceIcon, getIconPath } = Me.imports.utils.GenUtils;
const { ExpandableMenuItem } = Me.imports.ui.ExpandableMenuItem;
const { ExpandableDeviceMenuItem } = Me.imports.ui.ExpandableDeviceMenuItem;
const { DeviceMenuTitleItem } = Me.imports.ui.DeviceMenuTitleItem;
const { DeviceType } = Me.imports.utils.Constants;
const { DisplayMode } = Me.imports.utils.Constants;
const { getDeviceResetMessageBroadcaster } = Me.imports.utils.Broadcasters;
const { getTitleClickedMessageBroadcaster } = Me.imports.utils.Broadcasters;

const Gettext = imports.gettext;
const _ = Gettext.domain("network-stats").gettext;


/*
* PopupViewClass class represents the UI for dropdown menu.
*/

class PopupViewClass extends PanelMenu.Button {

    // Constructor
    /** @override */
    _init(logger, appSettingsModel) {
        super._init(0);
        this._logger = logger;
        this._appSettingsModel = appSettingsModel;
        this._menuItems = {};

        const mainLabel = new St.Label({
            text: '---',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'main-label'
        });
        this._mainLabel = mainLabel;

        const mainIcon = new St.Icon({
            //icon_name : 'security-low-symbolic',
            gicon: Gio.icon_new_for_string(getIconPath("network_check_white_24dp.svg")),
            style_class: 'system-status-icon',
        });
        this._mainIcon = mainIcon;

        const topBox = new St.BoxLayout();
        topBox.add_actor(this._mainLabel);
        if (this._appSettingsModel.showIcon === true) {
            topBox.add_actor(this._mainIcon);
        }
        this.add_actor(topBox);

        const upIcon = new St.Icon({
            gicon: Gio.icon_new_for_string(getIconPath("arrow_up_black_24dp.svg")),
            style_class: 'system-status-icon',
        });

        const downIcon = new St.Icon({
            gicon: Gio.icon_new_for_string(getIconPath("arrow_down_black_24dp.svg")),
            style_class: 'system-status-icon',
        });

        const upDownIcon = new St.Icon({
            gicon: Gio.icon_new_for_string(getIconPath("arrow_updown_black_24dp.svg")),
            style_class: 'system-status-icon',
        });

        const bothSpeedIcon = new St.Icon({
            gicon: Gio.icon_new_for_string(getIconPath("arrow_both_black_24dp.svg")),
            style_class: 'system-status-icon',
        });

        const settingIcon = new St.Icon({
            //icon_name: "emblem-system",
            gicon: Gio.icon_new_for_string(getIconPath("settings_black_24dp.svg")),
            style_class: 'system-status-icon',
        });

        const totalIcon = new St.Icon({
            gicon: Gio.icon_new_for_string(getIconPath("data_usage_black_24dp.svg")),
            style_class: 'system-status-icon',
        });

        const box = new St.BoxLayout({ style_class: "view-item", vertical: false });

        this._totalSpeed = new St.Button({
            style_class: 'ns-action-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            child: upDownIcon,
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true
        });

        this._downloadSpeed = new St.Button({
            style_class: 'message-list-clear-button ns-action-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            child: downIcon,
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true
        });

        this._uploadSpeed = new St.Button({
            style_class: 'message-list-clear-button ns-action-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            child: upIcon,
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true
        });

        this._bothSpeed = new St.Button({
            style_class: 'message-list-clear-button ns-action-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            child: bothSpeedIcon,
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true
        });

        this._dataUsage = new St.Button({
            style_class: 'ci-action-btn ns-action-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            child: totalIcon,
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true
        });

        this._settings = new St.Button({
            style_class: 'ci-action-btn ns-action-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            child: settingIcon,
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true
        });

        this._settings.connect('button-press-event', () => {
            if (typeof ExtensionUtils.openPrefs === 'function') {
                ExtensionUtils.openPrefs();
            }
        });

        box.add_child(this._totalSpeed);
        box.add_child(this._downloadSpeed);
        box.add_child(this._uploadSpeed);
        box.add_child(this._bothSpeed);
        box.add_child(this._dataUsage);
        box.add_child(this._settings);

        this._totalSpeed.connect("button-press-event", () => {
            //this._logger.debug("total speed button pressed");
            this._appSettingsModel.displayMode = DisplayMode.TOTAL_SPEED;
            this.updateGroupButtonsState();
        });
        this._downloadSpeed.connect("button-press-event", () => {
            //this._logger.debug("download speed button pressed");
            this._appSettingsModel.displayMode = DisplayMode.DOWNLOAD_SPEED;
            this.updateGroupButtonsState();
        });
        this._uploadSpeed.connect("button-press-event", () => {
            //this._logger.debug("upload speed button pressed");
            this._appSettingsModel.displayMode = DisplayMode.UPLOAD_SPEED;
            this.updateGroupButtonsState();
        });
        this._bothSpeed.connect("button-press-event", () => {
            //this._logger.debug("upload speed button pressed");
            this._appSettingsModel.displayMode = DisplayMode.BOTH_SPEED;
            this.updateGroupButtonsState();
        });
        this._dataUsage.connect("button-press-event", () => {
            //this._logger.debug("total data button pressed");
            this._appSettingsModel.displayMode = DisplayMode.TOTAL_DATA;
            this.updateGroupButtonsState();
        });
        this.updateGroupButtonsState();


        const popupMenuSection0 = new PopupMenu.PopupMenuSection();
        popupMenuSection0.actor.add_child(box);
        this.menu.addMenuItem(popupMenuSection0);

        const popupMenuSection1 = new PopupMenu.PopupMenuSection();
        popupMenuSection1.actor.add_child(new St.BoxLayout({ style_class: "v-spacer" }));
        this.menu.addMenuItem(popupMenuSection1);

        const popupMenuSection2 = new PopupMenu.PopupMenuSection();
        popupMenuSection2.actor.add_child(this.createSeparator());
        this.menu.addMenuItem(popupMenuSection2);

        const titleMenuItem = new DeviceMenuTitleItem(null, _("Device"), _("Speed"), _("Data Used"));
        const popupMenuSection3 = new PopupMenu.PopupMenuSection();
        popupMenuSection3.actor.add_child(titleMenuItem);
        this.menu.addMenuItem(popupMenuSection3);

        const popupMenuSection4 = new PopupMenu.PopupMenuSection();
        popupMenuSection4.actor.add_child(this.createSeparator());
        this.menu.addMenuItem(popupMenuSection4);

        // separator item
        //this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        this.connect('button-press-event', this.onMainButtonClicked.bind(this));
        this._settingsListener = this._appSettingsModel.subscribe(() => {
            this.updateGroupButtonsState();
        });
    }

    updateGroupButtonsState() {
        const { displayMode } = this._appSettingsModel;
        this.toggleButtonState(this._totalSpeed, displayMode == DisplayMode.TOTAL_SPEED);
        this.toggleButtonState(this._uploadSpeed, displayMode == DisplayMode.UPLOAD_SPEED);
        this.toggleButtonState(this._downloadSpeed, displayMode == DisplayMode.DOWNLOAD_SPEED);
        this.toggleButtonState(this._bothSpeed, displayMode == DisplayMode.BOTH_SPEED);
        this.toggleButtonState(this._dataUsage, displayMode == DisplayMode.TOTAL_DATA);
    }

    onMainButtonClicked(_button, event) {
        //this._logger.debug(event);
        const broadcaster = getTitleClickedMessageBroadcaster();
        if (event.get_button() == 1) {
            broadcaster.broadcast({ button: "left" });
        } else if (event.get_button() == 2) {
            broadcaster.broadcast({ button: "middle" });
        } else if (event.get_button() == 3) {
            broadcaster.broadcast({ button: "right" });
        }
    }

    toggleButtonState(button, value) {
        if (value != undefined) {
            if (value) {
                button.add_style_class_name("ns-action-button-down");
            } else {
                button.remove_style_class_name("ns-action-button-down");
            }
        } else {
            if (button.has_style_class_name("ns-action-button-down")) {
                button.remove_style_class_name("ns-action-button-down");
            } else {
                button.add_style_class_name("ns-action-button-down");
            }
        }
    }

    createSeparator() {
        const outerBox = new St.BoxLayout(
            {
                style_class: "v-separator-cont",
                x_expand: true,
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER,
            }
        );
        const innerBox = new St.BoxLayout({
            style_class: "h-line",
            x_expand: true,
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        outerBox.add_child(innerBox);
        return outerBox;
    }

    updateItem(device) {
        let menuItem = this._menuItems[device.name];
        const iconPath = getDeviceIcon(device.type);
        device.iconPath = iconPath;
        if (!menuItem) {
            menuItem = new ExpandableDeviceMenuItem(device, {
                defaultDeviceName: this._appSettingsModel.preferedDeviceName,
                onResetClicked: this.onResetClicked.bind(this, device.name),
                onMarkDefaultClicked: this.onMarkDefaultClicked.bind(this, device.name)
            });
            this.menu.addMenuItem(menuItem);
            this._menuItems[device.name] = menuItem;
        } else {
            menuItem.update(device, this._appSettingsModel.preferedDeviceName);
        }
    }

    onResetClicked(name) {
        this._logger.info(`Reset the device : ${name}`);
        getDeviceResetMessageBroadcaster().broadcast({ name });
    }

    onMarkDefaultClicked(name) {
        this._logger.info(`Mark the device "${name}" as default`);
        this._appSettingsModel.preferedDeviceName = name;
    }

    setTitleText(text) {
        this._mainLabel.set_text(text);
    }

    /** @override */
    vfunc_event(event) {
        if (event.type() == Clutter.EventType.TOUCH_BEGIN ||
            event.type() == Clutter.EventType.BUTTON_PRESS)
        {
            if (event.get_button() == 3) {
                // right click - just ignore it
                return;
            }
        }
        return super.vfunc_event(event);
    }

    /** @override */
    destroy() {
        if (this.menu) {
            this.menu.close();
        }
        this._uploadSpeed = undefined;
        this._downloadSpeed = undefined;
        this._totalSpeed = undefined;
        this._bothSpeed = undefined;
        this._dataUsage = undefined;
        this._appSettingsModel.unsubscribe(this._settingsListener);
        this._settingsListener = undefined;
        super.destroy();
    }
}

var PopupView = GObject.registerClass(PopupViewClass);