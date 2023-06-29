const { Clutter, St } = imports.gi;
const { GObject, Gio } = imports.gi;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { logger } = Me.imports.utils.Logger;


/*
* DeviceMenuTitleItemClass class is ui popup item for displaying table titles.
*/

class DeviceMenuTitleItemClass extends PopupMenu.PopupBaseMenuItem {

    _init(icon, name, speed, totalData) {
        super._init();

        this._icon = icon;
        this._nameLabel = new St.Label({
            text: name,
            style_class: "device-menu-item-label",
            y_align: Clutter.ActorAlign.CENTER
        });
        this._speedLabel = new St.Label({
            text: speed,
            style_class: "device-menu-item-label",
            y_align: Clutter.ActorAlign.CENTER
        });
        this._totalDataLabel = new St.Label({
            text: totalData,
            style_class: "device-menu-item-label",
            y_align: Clutter.ActorAlign.CENTER
        });

        if (this._icon != null) {
            this.add(this._icon);
        } else {
            this.add(new St.Label({ style_class: "icon-24" }));
        }
        this.add(this._nameLabel);
        this.add(this._speedLabel);
        this.add(this._totalDataLabel);
    }

    update(icon, name, speed, totalData) {
        this._nameLabel.set_text(name);
        this._speedLabel.set_text(speed);
        this._totalDataLabel.set_text(totalData);
    }
}

var DeviceMenuTitleItem = GObject.registerClass(DeviceMenuTitleItemClass);