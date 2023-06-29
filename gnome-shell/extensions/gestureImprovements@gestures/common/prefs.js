/* exported buildPrefsWidget */
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const Adw = imports.gi.Adw;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Me = imports.misc.extensionUtils.getCurrentExtension();
const { getAppKeybindingGesturePrefsPage } = Me.imports.common.appGestures;

/**
 * Bind value of setting to {@link Gtk.SpinButton}
 * @param key key of setting and id of {@link Gtk.SpinButton} object in builder
 */
function bind_int_value(key, settings, builder) {
	const button = builder.get_object(key);
	settings.bind(key, button, 'value', Gio.SettingsBindFlags.DEFAULT);
}

/**
 * Bind value of setting to {@link Gtk.Swich}
 * @param key key of setting and id of {@link Gtk.Switch} object in builder
 * @param flags flag used when binding setting's key to switch's {@link Gtk.Switch.active} status
 */
function bind_boolean_value(key, settings, builder, flags) {
	const button = builder.get_object(key);
	settings.bind(key, button, 'active', flags !== null && flags !== void 0 ? flags : Gio.SettingsBindFlags.DEFAULT);
}

/**
 * Bind value of setting to {@link Adw.ComboRow}
 * @param key key of settings and id of {@link Adw.ComboRow} object in builder
 */
function bind_combo_box(key, settings, builder) {
	const comboRow = builder.get_object(key);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const enum_key = key;
	comboRow.set_selected(settings.get_enum(enum_key));
	comboRow.connect('notify::selected', () => {
		settings.set_enum(enum_key, comboRow.selected);
	});
}

/**
 * Display value of `key` in log scale.
 * @param key key of setting and id of {@link Gtk.Scale} object in builder
 */
function display_in_log_scale(key, label_key, settings, builder) {
	const scale = builder.get_object(key);
	const label = builder.get_object(label_key);

	// display value in log scale
	scale.connect('value-changed', () => {
		const labelValue = Math.exp(scale.adjustment.value / Math.LOG2E).toFixed(2);
		label.set_text(labelValue);
		settings.set_double(key, parseFloat(labelValue));
	});

	const initialValue = Math.log2(settings.get_double(key));
	scale.set_value(initialValue);
}

/**
 * Binds preference widgets and settings keys
 * @param builder builder object for preference widgets
 * @param settings setting object of extension
 */
function bindPrefsSettings(builder, settings) {
	display_in_log_scale('touchpad-speed-scale', 'touchpad-speed-scale_display-value', settings, builder);
	display_in_log_scale('touchpad-pinch-speed', 'touchpad-pinch-speed_display-value', settings, builder);
	bind_int_value('alttab-delay', settings, builder);
	bind_int_value('hold-swipe-delay-duration', settings, builder);
	bind_boolean_value('default-session-workspace', settings, builder, Gio.SettingsBindFlags.INVERT_BOOLEAN);
	bind_boolean_value('default-overview', settings, builder, Gio.SettingsBindFlags.INVERT_BOOLEAN);
	bind_boolean_value('follow-natural-scroll', settings, builder);
	bind_boolean_value('default-overview-gesture-direction', settings, builder, Gio.SettingsBindFlags.INVERT_BOOLEAN);
	bind_boolean_value('enable-alttab-gesture', settings, builder);
	bind_boolean_value('enable-window-manipulation-gesture', settings, builder);
	bind_boolean_value('allow-minimize-window', settings, builder);
	bind_combo_box('pinch-3-finger-gesture', settings, builder);
	bind_combo_box('pinch-4-finger-gesture', settings, builder);
	bind_combo_box('overview-navifation-states', settings, builder);
}

function loadCssProvider(styleManager, uiDir) {
	const cssProvider = new Gtk.CssProvider();
	cssProvider.load_from_path(`${uiDir}/${styleManager.dark ? 'style-dark' : 'style'}.css`);
	const gtkDefaultDisplay = Gdk.Display.get_default();
	if (gtkDefaultDisplay) {
		Gtk.StyleContext.add_provider_for_display(gtkDefaultDisplay, cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
	}
}

function buildPrefsWidget(prefsWindow, settings, uiDir) {
	prefsWindow.set_search_enabled(true);
	const styleManager = Adw.StyleManager.get_default();
	styleManager.connect('notify::dark', () => loadCssProvider(styleManager, uiDir));
	loadCssProvider(styleManager, uiDir);
	const builder = new Gtk.Builder();
	builder.add_from_file(`${uiDir}/gestures.ui`);
	builder.add_from_file(`${uiDir}/customizations.ui`);

	// bind to settings
	bindPrefsSettings(builder, settings);

	// pinch gesture page
	prefsWindow.add(builder.get_object('gestures_page'));

	// application specific gestures
	const app_gesture_page = getAppKeybindingGesturePrefsPage(prefsWindow, settings);
	prefsWindow.add(app_gesture_page);

	// customize page
	prefsWindow.add(builder.get_object('customizations_page'));
}
