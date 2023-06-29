"use strict";
/* exported PrefsBoxOrderListEmptyPlaceholder */

const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var PrefsBoxOrderListEmptyPlaceholder = GObject.registerClass({
    GTypeName: "PrefsBoxOrderListEmptyPlaceholder",
    Template: Me.dir.get_child("ui").get_child("prefs-box-order-list-empty-placeholder.ui").get_uri()
}, class PrefsBoxOrderListEmptyPlaceholder extends Gtk.Box {
    // Handle a new drop on `this` properly.
    // `value` is the thing getting dropped.
    onDrop(_target, value, _x, _y) {
        // Get the GtkListBoxes of `this` and the drop value.
        const ownListBox = this.get_parent();
        const valueListBox = value.get_parent();

        // Remove the drop value from its list box.
        valueListBox.remove(value);

        // Insert the drop value into the list box of `this`.
        ownListBox.insert(value, 0);

        /// Finally save the box orders to settings.
        ownListBox.saveBoxOrderToSettings();
        valueListBox.saveBoxOrderToSettings();
    }
});
