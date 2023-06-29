// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Slider = imports.ui.slider;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain('text-scaler');
const _ = Gettext.gettext;

const DEFAULT_VALUE = 1.00;
const MIN_VALUE = 0.50;
const MAX_VALUE = 3.00;

const NUM_DECIMALS = 2;

const TEXT_SCALING_FACTOR_KEY = 'text-scaling-factor';

// Makes sure that the value is in [MIN_VALUE, MAX_VALUE].
function _normalizeValue(value) {
    return Math.max(MIN_VALUE, Math.min(value, MAX_VALUE));
}

// Translates a value in [MIN_VALUE, MAX_VALUE] to [0.00, 1.00].
function _textScalingToSliderValue(textScaling) {
    return (textScaling - MIN_VALUE) / (MAX_VALUE - MIN_VALUE);
}

// Translates a value in [0.00, 1.00] to [MIN_VALUE, MAX_VALUE].
function _sliderValueToTextScaling(sliderValue) {
    return sliderValue * (MAX_VALUE - MIN_VALUE) + MIN_VALUE;
}

// Checks if a given float number matches the default one using NUM_DECIMALS.
function _isDefaultFloatValue(value) {
    return Math.abs(value - DEFAULT_VALUE) < (Math.pow(10, -NUM_DECIMALS) / 2);
}

var TextScalerButton = GObject.registerClass({
    GTypeName: 'TextScalerButton',
}, class A extends GObject.Object {
    constructor() {
        super();

        this.actor = new PanelMenu.Button(0.0, "Text Scaler Button");
        this.actor.setSensitive(true);

        // GSettings to change the text-scaling factor.
        this._settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
        this._settings.connect('changed::text-scaling-factor', (settings, key) => this._onSettingsChanged(settings, key));

        // The actual text scaling factor, as a float.
        this._currentValue = this._get_text_scaling_factor();

        // Panel menu icon.
        this.actor.add_actor(new St.Icon({ style_class: 'system-status-icon',
                                           icon_name: 'preferences-desktop-font' }));

        // Popup Menu.
        this._menu = this.actor.menu;
        Main.panel.menuManager.addMenu(this._menu);

        this._menuItem = new PopupMenu.PopupBaseMenuItem({ activate: true });
        this._menuItem.connect('key-press-event', (actor, event) => this._onMenuItemKeyPressed(actor, event));
        this._menu.addMenuItem(this._menuItem);

        this._entry = new St.Entry();
        this._entry.clutter_text.connect('activate', (entry) => this._onEntryActivated(entry));
        this._entry.clutter_text.connect('key-focus-out', (entry) => this._onEntryKeyFocusOut(entry));
        this._menuItem.add_actor(this._entry);

        // The value currently displayed by the slider, normalized to [0.00, 1.00].
        this._sliderValue = _textScalingToSliderValue(this._currentValue);

        this._slider = new Slider.Slider(this._sliderValue);
        this._slider.connect('notify::value', (slider) => this._onSliderValueChanged(slider));
        this._slider.connect('drag-begin', (slider) => this._onSliderDragBegan(slider));
        this._slider.connect('drag-end', (slider) => this._onSliderDragEnded(slider));
        this._slider.x_expand = true;
        this._menuItem.add_actor(this._slider);

        this._sliderIsDragging = false;

        this._separatorItem = new PopupMenu.PopupSeparatorMenuItem();
        this._menu.addMenuItem(this._separatorItem);

        this._resetValueItem = new PopupMenu.PopupMenuItem(_("Reset to default value"));
        this._resetValueItem.connect('activate', (menuItem, event) => this._onResetValueActivate());
        this._menu.addMenuItem(this._resetValueItem);

        // Make sure we first update the UI with the current state.
        this._updateUI();
    }

    _onSettingsChanged(settings, key) {
        this._updateValue(this._get_text_scaling_factor(), false);
    }

    _onMenuItemKeyPressed(actor, event) {
        return this._slider.onKeyPressEvent(actor, event);
    }

    _onEntryActivated(entry) {
        this._updateValueFromTextEntry(entry);
    }

    _onEntryKeyFocusOut(entry) {
        this._updateValueFromTextEntry(entry);
    }

    _onSliderValueChanged(slider) {
        this._sliderValue = this._slider.value;
        this._updateEntry(_sliderValueToTextScaling(this._sliderValue));

        // We don't want to update the value when the user is explicitly
        // dragging the slider by clicking on the handle and moving it
        // around to avoid the unpredictable (and very confusing) behaviour
        // that would happen due to the mouse pointer being on a different
        // area of the screen right after updating the scaling factor.
        if (!this._sliderIsDragging)
            this._updateValue(_sliderValueToTextScaling(this._sliderValue));
    }

    _onSliderDragBegan(slider) {
        this._sliderIsDragging = true;
    }

    _onSliderDragEnded(slider) {
        // We don't update the scaling factor on 'value-changed'
        // when explicitly dragging, so we need to do it here too.
        this._updateValue(_sliderValueToTextScaling(this._sliderValue));
        this._sliderIsDragging = false;
    }

    _onResetValueActivate(menuItem, event) {
        this._updateValue(DEFAULT_VALUE);
    }

    _updateValueFromTextEntry(entry) {
        let currentText = entry.get_text();
        let value = parseFloat(currentText);

        // Only update the value if it's a valid one, otherwise
        // simply reset the UI to show the current status again.
        if (isFinite(currentText) && !isNaN(currentText) && !isNaN(value)) {
            this._updateValue(value);
        }

        // Force to always update the UI to make sure that whatever
        // value gets actually applied is displayed as it should be.
        this._updateUI();
    }

    // Reads the text scaling factor from GSettings and returns a valid double.
    _get_text_scaling_factor() {
        let gsettings_value = this._settings.get_double(TEXT_SCALING_FACTOR_KEY);
        if (isNaN(gsettings_value))
            return DEFAULT_VALUE;
        return gsettings_value;
    }

    _updateSettings() {
        this._settings.set_double(TEXT_SCALING_FACTOR_KEY, this._currentValue);
    }

    _updateValue(value, updateSettings=false) {
        if (this._currentValue == value)
            return;

        // Need to keep the value between the valid limits.
        this._currentValue = _normalizeValue(value);

        // We don't always want to update the GSettings (e.g. external change).
        if (!updateSettings) {
            this._updateSettings();
        }

        // Always affect the UI to reflect changes.
        this._updateUI();
    }

    _updateUI() {
        this._updateEntry();
        this._updateSlider();
        this._updateResetValueItem();
    }

    _updateEntry(value=null) {
        let valueToDisplay = (value != null) ? value : this._currentValue;

        // We only show NUM_DECIMALS decimals on the text entry widget.
        this._entry.set_text(valueToDisplay.toFixed(NUM_DECIMALS));
    }

    _updateSlider() {
        this._slider.value = _textScalingToSliderValue(this._currentValue);
    }

    _updateResetValueItem() {
        this._resetValueItem.setSensitive(!_isDefaultFloatValue(this._currentValue));
    }
}
);

let _button = null;

function init() {
    ExtensionUtils.initTranslations("text-scaler");
}

function enable() {
    _button = new TextScalerButton();
    Main.panel.addToStatusArea('text-scaler-button', _button.actor);
}

function disable() {
    _button.actor.destroy();
    _button = null;
}
