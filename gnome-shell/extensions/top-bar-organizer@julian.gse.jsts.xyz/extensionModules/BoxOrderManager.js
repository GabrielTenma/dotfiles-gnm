"use strict";
/* exported BoxOrderManager */

const GObject = imports.gi.GObject;

const ExtensionUtils = imports.misc.extensionUtils;

const Main = imports.ui.main;

/**
 * This class provides methods get, set and interact with box orders, while
 * taking over the work of translating between what is stored in settings and
 * what is really useable by the other extension code.
 * It's basically a heavy wrapper around the box orders stored in the settings.
 */
var BoxOrderManager = GObject.registerClass({
    Signals: {
        "appIndicatorReady": {}
    }
}, class BoxOrderManager extends GObject.Object {
    #appIndicatorReadyHandlerIdMap;
    #appIndicatorItemApplicationRoleMap;
    #settings;

    constructor(params = {}) {
        super(params);

        this.#appIndicatorReadyHandlerIdMap = new Map();
        this.#appIndicatorItemApplicationRoleMap = new Map();

        this.#settings = ExtensionUtils.getSettings();
    }

    /**
     * Handles an AppIndicator/KStatusNotifierItem item by associating the role
     * of the given item with the application of the
     * AppIndicator/KStatusNotifier item and returning a placeholder role.
     * In the case, where the application can't be determined, this method
     * throws an error. However it also makes sure that once the app indicators
     * "ready" signal emits, this classes "appIndicatorReady" signal emits as
     * well.
     * @param {string} indicatorContainer - The container of the indicator of the
     * AppIndicator/KStatusNotifierItem item.
     * @param {string} role - The role of the AppIndicator/KStatusNotifierItem
     * item.
     * @returns {string} The placeholder role.
     */
    #handleAppIndicatorItem(indicatorContainer, role) {
        const appIndicator = indicatorContainer.get_child()._indicator;
        let application = appIndicator.id;

        if (!application && this.#appIndicatorReadyHandlerIdMap) {
            const handlerId = appIndicator.connect("ready", () => {
                this.emit("appIndicatorReady");
                appIndicator.disconnect(handlerId);
                this.#appIndicatorReadyHandlerIdMap.delete(handlerId);
            });
            this.#appIndicatorReadyHandlerIdMap.set(handlerId, appIndicator);
            throw new Error("Application can't be determined.");
        }

        // Since the Dropbox client appends its PID to the id, drop the PID and
        // the hyphen before it.
        if (application.startsWith("dropbox-client-")) {
            application = "dropbox-client";
        }

        // Associate the role with the application.
        let roles = this.#appIndicatorItemApplicationRoleMap.get(application);
        if (roles) {
            // If the application already has an array of associated roles, just
            // add the role to it, if needed.
            if (!roles.includes(role)) {
                roles.push(role);
            }
        } else {
            // Otherwise create a new array.
            this.#appIndicatorItemApplicationRoleMap.set(application, [role]);
        }

        // Return the placeholder.
        // A box order containing this placeholder can later be resolved to
        // relevant roles using `#resolveAppIndicatorPlaceholders`.
        return `appindicator-kstatusnotifieritem-${application}`;
    }

    /**
     * Takes a box order and replaces AppIndicator placeholder roles with
     * actual roles.
     * @param {string[]} - The box order of which to replace placeholder roles.
     * @returns {string[]} - A box order with all placeholder roles
     * resolved/replaced to/with actual roles.
     */
    #resolveAppIndicatorPlaceholders(boxOrder) {
        let resolvedBoxOrder = [];
        for (const role of boxOrder) {
            // If the role isn't a placeholder, just add it to the resolved box
            // order.
            if (!role.startsWith("appindicator-kstatusnotifieritem-")) {
                resolvedBoxOrder.push(role);
                continue;
            }

            /// If the role is a placeholder, replace it.
            // First get the application this placeholder is associated with.
            const application = role.replace("appindicator-kstatusnotifieritem-", "");

            // Then get the actual roles associated with this application.
            let actualRoles = this.#appIndicatorItemApplicationRoleMap.get(application);

            // If there are no actual roles, continue.
            if (!actualRoles) {
                continue;
            }

            // Otherwise add the actual roles to the resolved box order.
            resolvedBoxOrder.push(...actualRoles);
        }

        return resolvedBoxOrder;
    }

    /**
     * Disconnects all signals (and disables future signal connection).
     * This is typically used before nulling an instance of this class to make
     * sure all signals are disconnected.
     */
    disconnectSignals() {
        for (const [handlerId, appIndicator] of this.#appIndicatorReadyHandlerIdMap) {
            if (handlerId && appIndicator?.signalHandlerIsConnected(handlerId)) {
                appIndicator.disconnect(handlerId);
            }
        }
        this.#appIndicatorReadyHandlerIdMap = null;
    }

    /**
     * This method returns a valid box order for the given top bar box.
     * This means it returns a box order, where only roles are included, which
     * have their associated indicator container already in some box of the
     * Gnome Shell top bar.
     * @param {string} box - The top bar box to return the valid box order for.
     * Must be one of the following values:
     * - "left"
     * - "center"
     * - "right"
     * @returns {string[]} - The valid box order.
     */
    createValidBoxOrder(box) {
        // Get a resolved box order.
        let boxOrder = this.#resolveAppIndicatorPlaceholders(this.#settings.get_strv(`${box}-box-order`));

        // ToDo: simplify.
        // Get the indicator containers (of the items) currently present in the
        // Gnome Shell top bar.
        const indicatorContainers = [
            Main.panel._leftBox.get_children(),
            Main.panel._centerBox.get_children(),
            Main.panel._rightBox.get_children()
        ].flat();

        // Create an indicator containers set from the indicator containers for
        // fast easy access.
        const indicatorContainerSet = new Set(indicatorContainers);

        // Go through the box order and only add items to the valid box order,
        // where their indicator is present in the Gnome Shell top bar
        // currently.
        let validBoxOrder = [];
        for (const role of boxOrder) {
            // Get the indicator container associated with the current role.
            const associatedIndicatorContainer = Main.panel.statusArea[role]?.container;

            if (indicatorContainerSet.has(associatedIndicatorContainer)) {
                validBoxOrder.push(role);
            }
        }

        return validBoxOrder;
    }

    /**
     * This method saves all new items currently present in the Gnome Shell top
     * bar to the correct box orders.
     */
    saveNewTopBarItems() {
        // Only run, when the session mode is "user" or the parent session mode
        // is "user".
        if(Main.sessionMode.currentMode !== "user" && Main.sessionMode.parentMode !== "user") {
            return;
        }

        // Load the configured box orders from settings.
        const boxOrders = {
            left: this.#settings.get_strv("left-box-order"),
            center: this.#settings.get_strv("center-box-order"),
            right: this.#settings.get_strv("right-box-order"),
        };

        // Get roles (of items) currently present in the Gnome Shell top bar and
        // index them using their associated indicator container.
        let indicatorContainerRoleMap = new Map();
        for (const role in Main.panel.statusArea) {
            indicatorContainerRoleMap.set(Main.panel.statusArea[role].container, role);
        }

        // Get the indicator containers (of the items) currently present in the
        // Gnome Shell top bar boxes.
        const boxIndicatorContainers = {
            left: Main.panel._leftBox.get_children(),
            center: Main.panel._centerBox.get_children(),
            // Reverse this array, since the items in the left and center box
            // are logically LTR, while the items in the right box are RTL.
            right: Main.panel._rightBox.get_children().reverse()
        };

        // This function goes through the indicator containers of the given box
        // and adds roles of new items to the box order.
        const addNewItemsToBoxOrder = (indicatorContainers, boxOrder, box) => {
            for (const indicatorContainer of indicatorContainers) {
                // First get the role associated with the current indicator
                // container.
                let role = indicatorContainerRoleMap.get(indicatorContainer);
                if (!role) {
                    continue;
                }

                // Handle an AppIndicator/KStatusNotifierItem item differently.
                if (role.startsWith("appindicator-")) {
                    try {
                        role = this.#handleAppIndicatorItem(indicatorContainer, role);
                    } catch (e) {
                        if (e.message !== "Application can't be determined.") {
                            throw(e);
                        }
                        continue;
                    }
                }

                // Add the role to the box order, if it isn't in in one already.
                if (!boxOrders.left.includes(role)
                    && !boxOrders.center.includes(role)
                    && !boxOrders.right.includes(role)) {
                    if (box === "right") {
                        // Add the items to the beginning for this array, since
                        // its RTL.
                        boxOrder.unshift(role);
                    } else {
                        boxOrder.push(role);
                    }
                }
            }
        };

        addNewItemsToBoxOrder(boxIndicatorContainers.left, boxOrders.left, "left");
        addNewItemsToBoxOrder(boxIndicatorContainers.center, boxOrders.center, "center");
        addNewItemsToBoxOrder(boxIndicatorContainers.right, boxOrders.right, "right");

        // This function saves the given box order to settings.
        const saveBoxOrderToSettings = (boxOrder, box) => {
            const currentBoxOrder = this.#settings.get_strv(`${box}-box-order`);
            // Only save the updated box order to settings, if it is different,
            // to avoid loops, when listening on settings changes.
            if (JSON.stringify(currentBoxOrder) !== JSON.stringify(boxOrder)) {
                this.#settings.set_strv(`${box}-box-order`, boxOrder);
            }
        };

        saveBoxOrderToSettings(boxOrders.left, "left");
        saveBoxOrderToSettings(boxOrders.center, "center");
        saveBoxOrderToSettings(boxOrders.right, "right");
    }
});
