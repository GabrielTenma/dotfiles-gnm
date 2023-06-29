const Me = imports.misc.extensionUtils.getCurrentExtension();
// Adapted from
// https://gitlab.com/rmnvgr/nightthemeswitcher-gnome-shell-extension/-/blob/main/src/preferences/DropDownChoice.js
// FIXME: There is probably some standard object we could use for this.
const { GObject } = imports.gi;
var DropDownChoice = GObject.registerClass({
    GTypeName: 'SpaceBarDropDownChoice',
    Properties: {
        id: GObject.ParamSpec.string('id', 'ID', 'Identifier', GObject.ParamFlags.READWRITE, null),
        title: GObject.ParamSpec.string('title', 'Title', 'Displayed title', GObject.ParamFlags.READWRITE, null),
    },
}, class DropDownChoice extends GObject.Object {
});
