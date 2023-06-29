const { PopupSubMenuMenuItem } = imports.ui.popupMenu;
const { Atk, Clutter, Gio, GObject, Graphene, Shell, St } = imports.gi;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { getIconPath } = Me.imports.utils.GenUtils;
const { logger } = Me.imports.utils.Logger;
const Gettext = imports.gettext;
const _ = Gettext.domain("network-stats").gettext;


/*
* ExpandableDeviceMenuItemClass class represents each interface item in dropdown UI.
*/

class ExpandableDeviceMenuItemClass extends PopupSubMenuMenuItem {
    _init(device,
        {
            defaultDeviceName,
            onResetClicked, 
            onMarkDefaultClicked,
        }
    ) {
        super._init("", false);

        const {
            iconPath,
        } = device;

        // header
        const box = new St.BoxLayout({ style_class: "popup-menu-item" });
        this.insert_child_at_index(box, 1);
        this._boxed = box;

        this._icon = new St.Icon({
            gicon: Gio.icon_new_for_string(iconPath),
            style_class: 'icon-24',
        });
        this._nameLabel = new St.Label({
            text: "",
            style_class: "device-menu-item-label",
            y_align: Clutter.ActorAlign.CENTER
        });
        this._speedLabel = new St.Label({
            text: "",
            style_class: "device-menu-item-label",
            y_align: Clutter.ActorAlign.CENTER
        });
        this._dataLabel = new St.Label({
            text: "",
            style_class: "device-menu-item-label",
            y_align: Clutter.ActorAlign.CENTER
        });
        box.insert_child_at_index(this._icon, 1);
        box.insert_child_at_index(this._nameLabel, 2);
        box.insert_child_at_index(this._speedLabel, 3);
        box.insert_child_at_index(this._dataLabel, 4);

        // IP address
        this._ipTitleLabel = new St.Label({
            text: "",
            style_class: "text-item text-right"
        });
        this._ipValueLabel = new St.Label({
            text: "",
            style_class: "text-item text-left"
        });
        this.addNewRowWithItems([
            this._ipTitleLabel,
            this._ipValueLabel
        ]);

        // Upload speed
        this._uploadSpeedTitleLabel = new St.Label({
            text: "",
            style_class: "text-item text-right"
        });
        this._uploadSpeedValueLabel = new St.Label({
            text: "",
            style_class: "text-item text-left"
        });
        this.addNewRowWithItems([
            this._uploadSpeedTitleLabel,
            this._uploadSpeedValueLabel
        ]);

        // Download speed
        this._downloadSpeedTitleLabel = new St.Label({
            text: "",
            style_class: "text-item text-right"
        });
        this._downloadSpeedValueLabel = new St.Label({
            text: "",
            style_class: "text-item text-left"
        });
        this.addNewRowWithItems([
            this._downloadSpeedTitleLabel,
            this._downloadSpeedValueLabel
        ]);

        // Total speed
        this._totalSpeedTitleLabel = new St.Label({
            text: "",
            style_class: "text-item text-right"
        });
        this._totalSpeedValueLabel = new St.Label({
            text: "",
            style_class: "text-item text-left"
        });
        this.addNewRowWithItems([
            this._totalSpeedTitleLabel,
            this._totalSpeedValueLabel
        ]);

        // Data used since last reset
        this._totalDataTitleLabel = new St.Label({
            text: "",
            style_class: "text-item text-right",
            y_align: Clutter.ActorAlign.CENTER
        });
        this._totalDataValueLabel = new St.Label({
            text: "",
            style_class: "text-item text-left",
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.addNewRowWithItems([
            this._totalDataTitleLabel,
            this._totalDataValueLabel
        ]);

        // Reseted At
        this._lastResetedTitleLabel = new St.Label({
            text: "",
            style_class: "text-item text-right",
            y_align: Clutter.ActorAlign.CENTER
        });
        this._lastResetedValueLabel = new St.Label({
            text: "text-item",
            y_align: Clutter.ActorAlign.CENTER
        });

        const resetIcon = new St.Icon({
            gicon: Gio.icon_new_for_string(getIconPath("restart_alt_black_24dp.svg")),
            style_class: 'icon-16',
        });

        const resetButton = new St.Button({
            style_class: 'ci-action-btn ns-button',
            can_focus: true,
            child: resetIcon,
            x_align: Clutter.ActorAlign.END,
            x_expand: true,
            y_expand: true
        });

        resetButton.connect('button-press-event', onResetClicked);
        this._resetButton = resetButton;
        this.addNewRowWithItems([
            this._lastResetedTitleLabel,
            this._lastResetedValueLabel,
            this._resetButton
        ]);

        // Mark default device or interface to monitor.
        this._makeDefaultTitleLabel = new St.Label({
            text: "",
            style_class: "text-item text-right",
            y_align: Clutter.ActorAlign.CENTER
        });
        this._makeDefaultValueLabel = new St.Label({
            text: "text-item",
            y_align: Clutter.ActorAlign.CENTER
        });

        const makeDefaultLabel = new St.Label({
            text: _("Make Default"),
        });

        const makeDefaultButton = new St.Button({
            style_class: 'ns-button ns-text-button',
            can_focus: true,
            child: makeDefaultLabel,
            x_align: Clutter.ActorAlign.END,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: false,
            y_expand: true
        });

        makeDefaultButton.connect('button-press-event', onMarkDefaultClicked);
        this._makeDefaultButton = makeDefaultButton;
        this.addNewRowWithItems([
            this._makeDefaultTitleLabel,
            this._makeDefaultValueLabel,
            this._makeDefaultButton
        ]);

        this.update(device, defaultDeviceName);
    }

    addNewRowWithItems(items) {
        const box = new St.BoxLayout({
            style_class: "popup-menu-item",
            vertical: false
        });
        for (const item of items) {
            box.add_child(item);
        }
        this.menu.box.add_child(box);
        return box;
    }

    update(device, defaultDeviceName) {
        const {
            //iconPath,
            name,
            upSpeed,
            downSpeed,
            totalSpeed,
            totalData,
            ip,
            startTime,
        } = device;

        //this._icon.set_gicon(iconPath);
        this._nameLabel.set_text(name);
        this._speedLabel.set_text(totalSpeed);
        this._dataLabel.set_text(totalData);

        // details
        this._ipTitleLabel.set_text(`${_("IP")} [♁] : `);
        this._ipValueLabel.set_text(ip);
        
        this._uploadSpeedTitleLabel.set_text(`${_("Upload speed")} [↑] : `);
        this._uploadSpeedValueLabel.set_text(upSpeed);

        this._downloadSpeedTitleLabel.set_text(`${_("Download speed")} [↓] : `);
        this._downloadSpeedValueLabel.set_text(downSpeed);


        this._totalSpeedTitleLabel.set_text(`${_("Total speed")} [↕] : `);
        this._totalSpeedValueLabel.set_text(totalSpeed);

        this._totalDataTitleLabel.set_text(`${_("Total data used")} [Σ] : `);
        this._totalDataValueLabel.set_text(`${totalData} -- ${_("Since last reset")}`);

        this._lastResetedTitleLabel.set_text(`${_("Last reset at")} [⚐] : `);
        this._lastResetedValueLabel.set_text(startTime);

        let symbol = "★";
        if (name === defaultDeviceName) {
            this._makeDefaultValueLabel.set_text(`${_("Yes")}`);
            this._makeDefaultButton.hide();
        } else {
            this._makeDefaultValueLabel.set_text(`${_("No")}`);
            symbol = "☆";
            this._makeDefaultButton.show();
        }
        this._makeDefaultTitleLabel.set_text(`${_("Default device")} [${symbol}] : `);
    }
}

var ExpandableDeviceMenuItem = GObject.registerClass(ExpandableDeviceMenuItemClass);