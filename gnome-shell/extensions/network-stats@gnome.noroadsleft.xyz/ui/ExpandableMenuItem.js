const { PopupSubMenuMenuItem } = imports.ui.popupMenu;
const { GObject } = imports.gi;


/*
* ExpandableMenuItemClass class for creating expandable menu item.
*/

class ExpandableMenuItemClass extends PopupSubMenuMenuItem {
    _init(content) {
        super._init("", false);
        content.add_style_class_name("popup-menu-item");
        this.insert_child_at_index(content, 1);
    }
}

var ExpandableMenuItem = GObject.registerClass(ExpandableMenuItemClass);