"use strict";
/* exported init */

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Main = imports.ui.main;
const Panel = imports.ui.panel;

const BoxOrderManager = Me.imports.extensionModules.BoxOrderManager;

class Extension {
    constructor() {
    }

    enable() {
        this._settings = ExtensionUtils.getSettings();

        this._boxOrderManager = new BoxOrderManager.BoxOrderManager();

        /// Stuff to do on startup(extension enable).
        // Initially handle new top bar items and order top bar boxes.
        this.#handleNewItemsAndOrderTopBar();

        // Overwrite `Panel._addToPanelBox` method with one handling new items
        // and also handle AppIndicators getting ready, to handle new items.
        this.#overwritePanelAddToPanelBox();
        this._boxOrderManager.connect("appIndicatorReady", () => {
            this.#handleNewItemsAndOrderTopBar();
        });

        // Handle changes of configured box orders.
        this._settingsHandlerIds = [];
        const addConfiguredBoxOrderChangeHandler = (box) => {
            let handlerId = this._settings.connect(`changed::${box}-box-order`, () => {
                this.#handleNewItemsAndOrderTopBar();
            });
            this._settingsHandlerIds.push(handlerId);
        };
        addConfiguredBoxOrderChangeHandler("left");
        addConfiguredBoxOrderChangeHandler("center");
        addConfiguredBoxOrderChangeHandler("right");
    }

    disable() {
        // Revert the overwrite of `Panel._addToPanelBox`.
        Panel.Panel.prototype._addToPanelBox = Panel.Panel.prototype._originalAddToPanelBox;
        // Set `Panel._originalAddToPanelBox` to `undefined`.
        Panel._originalAddToPanelBox = undefined;

        // Disconnect signals.
        for (const handlerId of this._settingsHandlerIds) {
            this._settings.disconnect(handlerId);
        }
        this._boxOrderManager.disconnectSignals();

        this._settings = null;
        this._boxOrderManager = null;
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Methods used on extension enable.                                    ///
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Overwrite `Panel._addToPanelBox` with a custom method, which simply calls
     * the original one and handles new items and orders the top bar afterwards.
     */
    #overwritePanelAddToPanelBox() {
        // Add the original `Panel._addToPanelBox` method as
        // `Panel._originalAddToPanelBox`.
        Panel.Panel.prototype._originalAddToPanelBox = Panel.Panel.prototype._addToPanelBox;

        const handleNewItemsAndOrderTopBar = () => {
            this.#handleNewItemsAndOrderTopBar();
        };

        // Overwrite `Panel._addToPanelBox`.
        Panel.Panel.prototype._addToPanelBox = function(role, indicator, position, box) {
            // Simply call the original `_addToPanelBox` and order the top bar
            // and handle new items afterwards.
            this._originalAddToPanelBox(role, indicator, position, box);
            handleNewItemsAndOrderTopBar();
        };
    }

    ////////////////////////////////////////////////////////////////////////////
    /// Helper methods holding logic needed by other methods.                ///
    ////////////////////////////////////////////////////////////////////////////

    /**
     * This method orders the top bar items of the specified box according to
     * the configured box orders.
     * @param {string} box - The box to order.
     */
    #orderTopBarItems(box) {
        // Only run, when the session mode is "user" or the parent session mode
        // is "user".
        if(Main.sessionMode.currentMode !== "user" && Main.sessionMode.parentMode !== "user") {
            return;
        }

        // Get the valid box order.
        const validBoxOrder = this._boxOrderManager.createValidBoxOrder(box);

        // Get the relevant box of `Main.panel`.
        let panelBox;
        switch (box) {
            case "left":
                panelBox = Main.panel._leftBox;
                break;
            case "center":
                panelBox = Main.panel._centerBox;
                break;
            case "right":
                panelBox = Main.panel._rightBox;
                break;
        }

        /// Go through the items (or rather their roles) of the validBoxOrder
        /// and order the panelBox accordingly.
        for (let i = 0; i < validBoxOrder.length; i++) {
            const role = validBoxOrder[i];
            // Get the indicator container associated with the current role.
            const associatedIndicatorContainer = Main.panel.statusArea[role].container;

            // Save whether or not the indicator container is visible.
            const isVisible = associatedIndicatorContainer.visible;

            associatedIndicatorContainer.get_parent().remove_child(associatedIndicatorContainer);
            if (box === "right") {
                // If the target panel box is the right panel box, insert the
                // indicator container at index `-1`, which just adds it to the
                // end (correct order is ensured, since `validBoxOrder` is
                // sorted correctly and we're looping over it in order).
                // This way unaccounted-for indicator containers will be at the
                // left, which is preferred, since the box is logically
                // right-to-left.
                // The same applies for indicator containers, which are just
                // temporarily unaccounted for (like for indicator containers of
                // not yet ready app indicators), since them being at the right
                // for a probably temporary stay causes all the indicator
                // containers to shift.
                panelBox.insert_child_at_index(associatedIndicatorContainer, -1);
            } else {
                panelBox.insert_child_at_index(associatedIndicatorContainer, i);
            }

            // Hide the indicator container again, if it wasn't visible.
            if (!isVisible) {
                associatedIndicatorContainer.hide();
            }
        }
        // To handle the case, where the box order got set to a permutation
        // of an outdated box order, it would be wise, if the caller updated the
        // box order now to include the items present in the top bar.
    }

    /**
     * This method handles all new items currently present in the top bar and
     * orders the items of all top bar boxes.
     */
    #handleNewItemsAndOrderTopBar() {
        // Only run, when the session mode is "user" or the parent session mode
        // is "user".
        if(Main.sessionMode.currentMode !== "user" && Main.sessionMode.parentMode !== "user") {
            return;
        }

        this._boxOrderManager.saveNewTopBarItems();
        this.#orderTopBarItems("left");
        this.#orderTopBarItems("center");
        this.#orderTopBarItems("right");
        // In `this.#orderTopBarItems` it says to update the box orders to
        // include potentially new items, since the ordering might have been
        // based on an outdated box order. However, since we already handle new
        // top bar items at the beginning of this method, this isn't a concern.
    }
}

function init() {
    return new Extension();
}
