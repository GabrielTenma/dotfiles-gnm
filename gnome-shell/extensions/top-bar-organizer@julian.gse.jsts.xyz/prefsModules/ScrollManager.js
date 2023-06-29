"use strict";
/* exported ScrollManager */
const GLib = imports.gi.GLib;

var ScrollManager = class ScrollManager {
    #gtkScrolledWindow;
    #scrollUp;
    #scrollDown;

    /**
     * @param {Gtk.ScrolledWindow} gtkScrolledWindow
     */
    constructor(gtkScrolledWindow) {
        this.#gtkScrolledWindow = gtkScrolledWindow;

        this.#scrollUp = false;
        this.#scrollDown = false;
    }

    startScrollUp() {
        // If the scroll up is already started, don't do anything.
        if (this.#scrollUp) {
            return;
        }

        // Make sure scroll down is stopped.
        this.stopScrollDown();

        this.#scrollUp = true;

        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
            // Set the new vadjustment value to either the current value minus a
            // step increment or to 0.
            const newVAdjustementValue = Math.max(this.#gtkScrolledWindow.vadjustment.get_value() - this.#gtkScrolledWindow.vadjustment.get_step_increment(), 0);

            // If the new value is the old one, return and stop this interval.
            if (newVAdjustementValue === this.#gtkScrolledWindow.vadjustment.get_value()) {
                this.#scrollUp = false;
                return this.#scrollUp;
            }
            // Otherwise, update the value.
            this.#gtkScrolledWindow.vadjustment.set_value(newVAdjustementValue);
            return this.#scrollUp;
        });
    }

    startScrollDown() {
        // If the scroll down is already started, don't do anything.
        if (this.#scrollDown) {
            return;
        }

        // Make sure scroll up is stopped.
        this.stopScrollUp();

        this.#scrollDown = true;

        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
            // Set the new vadjusment value either to the curent value plus a
            // step increment or to the upper value minus the page size.
            const newVAdjustementValue = Math.min(
                this.#gtkScrolledWindow.vadjustment.get_value() + this.#gtkScrolledWindow.vadjustment.get_step_increment(),
                this.#gtkScrolledWindow.vadjustment.get_upper() - this.#gtkScrolledWindow.vadjustment.get_page_size()
            );

            // If the new value is the old one, return and stop this interval.
            if (newVAdjustementValue === this.#gtkScrolledWindow.vadjustment.get_value()) {
                this.#scrollDown = false;
                return this.#scrollDown;
            }
            // Otherwise, update the value.
            this.#gtkScrolledWindow.vadjustment.set_value(newVAdjustementValue);
            return this.#scrollDown;
        });
    }

    stopScrollUp() {
        this.#scrollUp = false;
    }

    stopScrollDown() {
        this.#scrollDown = false;
    }

    stopScrollAll() {
        this.stopScrollUp();
        this.stopScrollDown();
    }
};
