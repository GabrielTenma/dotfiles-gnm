const { PopupSubMenuMenuItem } = imports.ui.popupMenu;
const { Atk, Clutter, Gio, GObject, Graphene, Shell, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { logger } = Me.imports.utils.Logger;

/*
* TableViewClass class to create a table layout.
*/

class TableViewClass extends St.BoxLayout {
    // constructor
    _init(props) {
        super._init(props);
    }

    addRow(...controls) {
        const box = new St.BoxLayout({ vertical: false });
        for (const control of controls) {
            box.add_child(control);
        }
        this.add_child(box);
    }

    removeRow(index) {
        const child = this.get_child_at_index(index);
        if (child) {
            this.remove_actor(child);
        }
    }
}

var TableView = GObject.registerClass(TableViewClass);