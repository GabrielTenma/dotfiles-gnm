/* exported init, fillPreferencesWindow */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const { buildPrefsWidget } = Me.imports.common.prefs;
const ExtensionUtils = imports.misc.extensionUtils;
const ExtMe = ExtensionUtils.getCurrentExtension();

// eslint-disable-next-line @typescript-eslint/no-empty-function
function init() { }

function fillPreferencesWindow(prefsWindow) {
	var _a;
	const UIDirPath = (_a = ExtMe.dir.get_child('ui').get_path()) !== null && _a !== void 0 ? _a : '';
	const settings = ExtensionUtils.getSettings();
	buildPrefsWidget(prefsWindow, settings, UIDirPath);
}
