const { St, Gio } = imports.gi;
const Me = ExtensionUtils.getCurrentExtension();
const { getIconPath } = Me.imports.utils.GenUtils;

/**
 * create new Icon object for given iconName
 * @param {string} iconName
 * @returns Icon UI object
 */
 function createIcon(iconName) {
    const icon = new St.Icon({
        gicon : Gio.icon_new_for_string(getIconPath(iconName)),
        style_class : 'system-status-icon',
    });
    return icon;
}