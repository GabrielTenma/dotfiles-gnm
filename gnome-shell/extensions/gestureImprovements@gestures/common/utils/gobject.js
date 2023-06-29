/**
 * @file This file provides {@link registerClass} function similar to {@link GObject.registerClass}
 * Modification provided by {@link registerClass}
 *  - Add `connect(signal_name, ....)` function to prototype returned
 *  - Use parameters of constructor of class , instead of `_init` function of class for new method of prototype returned
 *  - Make `Properties` parameter mandatory @{link https://gitlab.gnome.org/ewlsh/gi.ts/-/issues/6}
 */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* exported registerClass */
const GObject = imports.gi.GObject;
const OGRegisterClass = GObject.registerClass;

function registerClass(...args) {
	if (args.length === 2)
		return OGRegisterClass(args[0], args[1]);
	return OGRegisterClass(args[0]);
}
