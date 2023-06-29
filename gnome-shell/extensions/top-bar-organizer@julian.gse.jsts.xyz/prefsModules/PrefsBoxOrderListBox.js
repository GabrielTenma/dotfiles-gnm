"use strict";
/* exported PrefsBoxOrderListBox */

const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PrefsBoxOrderItemRow = Me.imports.prefsModules.PrefsBoxOrderItemRow;
const PrefsBoxOrderListEmptyPlaceholder = Me.imports.prefsModules.PrefsBoxOrderListEmptyPlaceholder;

var PrefsBoxOrderListBox = GObject.registerClass({
    GTypeName: "PrefsBoxOrderListBox",
    Template: Me.dir.get_child("ui").get_child("prefs-box-order-list-box.ui").get_uri(),
    Properties: {
        BoxOrder: GObject.ParamSpec.string(
            "box-order",
            "Box Order",
            "The box order this PrefsBoxOrderListBox is associated with.",
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY,
            ""
        )
    }
}, class PrefsBoxOrderListBox extends Gtk.ListBox {
    #settings;

    /**
     * @param {Object} params
     */
    constructor(params = {}) {
        super(params);

        // Load the settings.
        this.#settings = ExtensionUtils.getSettings();

        // Add a placeholder widget for the case, where no GtkListBoxRows are
        // present.
        this.set_placeholder(new PrefsBoxOrderListEmptyPlaceholder.PrefsBoxOrderListEmptyPlaceholder());
    }

    get boxOrder() {
        return this._boxOrder;
    }

    set boxOrder(value) {
        this._boxOrder = value;

        // Load the settings here as well, since a `CONSTRUCT_ONLY` property
        // apparently can't access `this.#settings`.
        const settings = ExtensionUtils.getSettings();
        // Get the actual box order for the given box order name from settings.
        const boxOrder = settings.get_strv(this._boxOrder);
        // Populate this GtkListBox with GtkListBoxRows for the items of the
        // given configured box order.
        for (const item of boxOrder) {
            const listBoxRow = new PrefsBoxOrderItemRow.PrefsBoxOrderItemRow({}, item);
            this.append(listBoxRow);
        }

        this.notify("box-order");
    }

    /**
     * Saves the box order represented by `this` (and its
     * `PrefsBoxOrderItemRows`) to settings.
     */
    saveBoxOrderToSettings() {
        let currentBoxOrder = [];
        for (let potentialPrefsBoxOrderItemRow of this) {
            // Only process PrefsBoxOrderItemRows.
            if (potentialPrefsBoxOrderItemRow.constructor.$gtype.name !== "PrefsBoxOrderItemRow") {
                continue;
            }

            const item = potentialPrefsBoxOrderItemRow.item;
            currentBoxOrder.push(item);
        }
        this.#settings.set_strv(this.boxOrder, currentBoxOrder);
    }
});
