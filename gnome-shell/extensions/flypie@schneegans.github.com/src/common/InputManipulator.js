//////////////////////////////////////////////////////////////////////////////////////////
//                               ___            _     ___                               //
//                               |   |   \/    | ) |  |                                 //
//                           O-  |-  |   |  -  |   |  |-  -O                            //
//                               |   |_  |     |   |  |_                                //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////

// SPDX-FileCopyrightText: Simon Schneegans <code@simonschneegans.de>
// SPDX-License-Identifier: MIT

'use strict';

const {Clutter, Gtk} = imports.gi;

const Me    = imports.misc.extensionUtils.getCurrentExtension();
const utils = Me.imports.src.common.utils;

//////////////////////////////////////////////////////////////////////////////////////////
// An instance of this class can be used to create faked input events. You can use it   //
// to move the mouse pointer or to press accelerator key strokes.                       //
//////////////////////////////////////////////////////////////////////////////////////////

var InputManipulator = class InputManipulator {

  // ------------------------------------------------------------ constructor / destructor

  constructor() {

    // get_default_seat() is available since GNOME Shell 3.36.
    if (Clutter.get_default_backend().get_default_seat) {
      const dev      = Clutter.get_default_backend().get_default_seat();
      this._mouse    = dev.create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE);
      this._keyboard = dev.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
    } else {
      const dev      = Clutter.DeviceManager.get_default();
      this._mouse    = dev.create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE);
      this._keyboard = dev.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
    }
  }

  // -------------------------------------------------------------------- public interface

  // Warps the mouse pointer to the specified position.
  warpPointer(x, y) {
    this._mouse.notify_absolute_motion(0, x, y);
  }

  // Simulates the activation of a given accelerator. The string can be anything accepted
  // by Gtk.accelerator_parse(). That is, for example, "<Control>a" or "<Shift><Alt>F1".
  activateAccelerator(string) {

    // First we release any currently pressed modifiers.
    const currentMods = global.get_pointer()[2];
    this._releaseModifiers(currentMods);

    // Now parse the string and press the buttons accordingly.
    const res = Gtk.accelerator_parse(string);
    let ok, keyval, mods;

    // The return value is different in GTK4.
    if (utils.gtk4()) {
      [ok, keyval, mods] = res;
    } else {
      [keyval, mods] = res;
    }

    this._pressModifiers(mods);
    this._keyboard.notify_keyval(0, keyval, Clutter.KeyState.PRESSED);
    this._keyboard.notify_keyval(0, keyval, Clutter.KeyState.RELEASED);
    this._releaseModifiers(mods);

    // Finally we re-press the modifiers which were pressed before.
    this._pressModifiers(currentMods);
  }

  // ----------------------------------------------------------------------- private stuff

  // Helper method which 'releases' the desired modifier keys.
  _releaseModifiers(modifiers) {

    // Since we do not know whether left or right version of each key is pressed, we
    // release both...
    if (modifiers & Clutter.ModifierType.CONTROL_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
      this._keyboard.notify_keyval(0, Clutter.KEY_Control_R, Clutter.KeyState.RELEASED);
    }

    if (modifiers & Clutter.ModifierType.SHIFT_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Shift_L, Clutter.KeyState.RELEASED);
      this._keyboard.notify_keyval(0, Clutter.KEY_Shift_R, Clutter.KeyState.RELEASED);
    }

    if (modifiers & Clutter.ModifierType.MOD1_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Alt_L, Clutter.KeyState.RELEASED);
      this._keyboard.notify_keyval(0, Clutter.KEY_Alt_R, Clutter.KeyState.RELEASED);
    }

    if ((modifiers & Clutter.ModifierType.MOD4_MASK) ||
        (modifiers & Clutter.ModifierType.SUPER_MASK)) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Super_L, Clutter.KeyState.RELEASED);
      this._keyboard.notify_keyval(0, Clutter.KEY_Super_R, Clutter.KeyState.RELEASED);
    }
  }

  // Helper method which 'presses' the desired modifier keys.
  _pressModifiers(modifiers) {
    if (modifiers & Clutter.ModifierType.CONTROL_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Control_L, Clutter.KeyState.PRESSED);
    }

    if (modifiers & Clutter.ModifierType.SHIFT_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Shift_L, Clutter.KeyState.PRESSED);
    }

    if (modifiers & Clutter.ModifierType.MOD1_MASK) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Alt_L, Clutter.KeyState.PRESSED);
    }

    if ((modifiers & Clutter.ModifierType.MOD4_MASK) ||
        (modifiers & Clutter.ModifierType.SUPER_MASK)) {
      this._keyboard.notify_keyval(0, Clutter.KEY_Super_L, Clutter.KeyState.PRESSED);
    }
  }
};
