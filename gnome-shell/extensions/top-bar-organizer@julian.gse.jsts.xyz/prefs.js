"use strict";
/* exported buildPrefsWidget, init */

const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const PrefsPage = Me.imports.prefsModules.PrefsPage;

function buildPrefsWidget() {
    const provider = new Gtk.CssProvider();
    provider.load_from_path(Me.dir.get_path() + "/css/prefs.css");
    const defaultGdkDisplay = Gdk.Display.get_default();
    Gtk.StyleContext.add_provider_for_display(
        defaultGdkDisplay,
        provider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );

    const prefsPage = new PrefsPage.PrefsPage();

    prefsPage.connect("destroy", () => {
        Gtk.StyleContext.remove_provider_for_display(
            defaultGdkDisplay,
            provider
        );
    });

    return prefsPage;
}

function init() {
}
