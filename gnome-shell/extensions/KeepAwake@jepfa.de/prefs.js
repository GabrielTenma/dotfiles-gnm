const GdkPixbuf = imports.gi.GdkPixbuf;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Config = imports.misc.config;
const [major] = Config.PACKAGE_VERSION.split('.');
const shellVersion = Number.parseInt(major);

const Gettext = imports.gettext.domain('KeepAwake');
const _ = Gettext.gettext;

const NO_COLOR_BACKGROUND = 'no-color-background';
const ENABLE_NOTIFICATIONS = 'enable-notifications';
const BACKGROUND_COLOR = 'background-color';


function init() {
    ExtensionUtils.initTranslations("KeepAwake");
}

function ShowDesktopSettingsWidget() {
    this._init();
}

ShowDesktopSettingsWidget.prototype = {

    _init: function() {
        this._grid = new Gtk.Grid();
        this._grid.margin_start = 50;
        this._grid.margin_end = 50;
        this._grid.margin_top = 50;
        this._grid.margin_bottom = 50;
        this._grid.row_spacing = this._grid.column_spacing = 20;
  	    this._settings = ExtensionUtils.getSettings();

        // first setting row
        let enableNotificationsLabel = _("Show notifications on mode change");

        this._grid.attach(new Gtk.Label({ label: enableNotificationsLabel, wrap: true, sensitive: true,
                                   margin_bottom: 10, margin_top: 5 }),
                                    0, 0, 1, 1);

        let currentEnableNotifications = this._settings.get_boolean(ENABLE_NOTIFICATIONS);
        let enableNotificationsSwitcher = new Gtk.Switch();
        enableNotificationsSwitcher.active = currentEnableNotifications;
        this._grid.attach(enableNotificationsSwitcher, 1, 0, 1, 1);
        enableNotificationsSwitcher.connect('state-set', () => {
              this._settings.set_boolean(ENABLE_NOTIFICATIONS, !this._settings.get_boolean(ENABLE_NOTIFICATIONS));
            });

        // second setting row
        let colorOnBackgroundLabel = _("Show background-colored icon if keep awake is enabled");

        this._grid.attach(new Gtk.Label({ label: colorOnBackgroundLabel, wrap: true, sensitive: true,
                                   margin_bottom: 10, margin_top: 5 }),
                                    0, 1, 1, 1);

        let currentNoColorBackground = this._settings.get_boolean(NO_COLOR_BACKGROUND);
        let noColorBackgroundSwitcher = new Gtk.Switch();
        noColorBackgroundSwitcher.active = !currentNoColorBackground;
        this._grid.attach(noColorBackgroundSwitcher, 1, 1, 1, 1);

        noColorBackgroundSwitcher.connect('state-set',() => {
              this._settings.set_boolean(NO_COLOR_BACKGROUND, !this._settings.get_boolean(NO_COLOR_BACKGROUND));
            });


        // third setting row
        let colorBackgroundLabel = _("Use this background color");

        this._grid.attach(new Gtk.Label({ label: colorBackgroundLabel, wrap: true, sensitive: true,
                                   margin_bottom: 10, margin_top: 5 }),
                                    0, 2, 1, 1);

        const rgba = new Gdk.RGBA();
        rgba.parse(this._settings.get_string(BACKGROUND_COLOR));

        let backgroundColor = new Gtk.ColorButton({
            rgba: rgba,
            show_editor: true,
            use_alpha: true,
            visible: true
        });
        this._grid.attach(backgroundColor, 1, 2, 1, 1);

        backgroundColor.connect('color-set', () => {
            this._settings.set_string(BACKGROUND_COLOR, backgroundColor.get_rgba().to_string());
        });

    },

    _completePrefsWidget: function() {
        let scollingWindow = new Gtk.ScrolledWindow({
                                 'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'hexpand': true, 'vexpand': true});
        if (shellVersion >= 40){
            scollingWindow.set_child(this._grid);
            scollingWindow.show();
        }else {
            scollingWindow.add_with_viewport(this._grid);
            scollingWindow.show_all();
        }
        return scollingWindow;
    }
};

function buildPrefsWidget() {
    let widget = new ShowDesktopSettingsWidget();
    return widget._completePrefsWidget();
}
