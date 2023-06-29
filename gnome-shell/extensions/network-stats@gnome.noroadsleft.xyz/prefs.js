const { Gio, GObject, Gtk } = imports.gi;
const Lang = imports.lang;
const Pango = imports.gi.Pango;
const Gettext = imports.gettext;
const _ = Gettext.domain("network-stats").gettext;


const Me = imports.misc.extensionUtils.getCurrentExtension();
const { DisplayMode } = Me.imports.utils.Constants;
const { ResetSchedule } = Me.imports.utils.Constants;
const { DayOfWeek } = Me.imports.utils.Constants;
const { SettingKeys } = Me.imports.utils.Constants;
const { kSchemaName } = Me.imports.utils.Constants;
const { setTimeout } = Me.imports.utils.DateTimeUtils;
const { isGtk3, addChildToBox } = Me.imports.utils.GtkUtils;
const { Logger } = Me.imports.utils.Logger;
const { appSettingsModel } = Me.imports.AppSettingsModel;


class IndexMap {
    constructor(obj) {
        this._reverseMap = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                this._reverseMap[obj[key]] = key;
            }
        }
        this._forwardMap = obj;
    }

    getIndex(value) {
        const index = this._reverseMap[value];
        return index || -1;
    }

    getValue(index) {
        return this._forwardMap[index];
    }
}

const kDisplayModeMapping = new IndexMap({
    0: DisplayMode.TOTAL_SPEED,
    1: DisplayMode.UPLOAD_SPEED,
    2: DisplayMode.DOWNLOAD_SPEED,
    3: DisplayMode.BOTH_SPEED,
    4: DisplayMode.TOTAL_DATA
});

const kResetScheduleMapping = new IndexMap({
    0: ResetSchedule.DAILY,
    1: ResetSchedule.WEEKLY,
    2: ResetSchedule.BIWEEKLY,
    3: ResetSchedule.MONTHLY,
    4: ResetSchedule.NEVER
});

const kDayOfWeekMapping = new IndexMap({
    0: DayOfWeek.MONDAY,
    1: DayOfWeek.TUESDAY,
    2: DayOfWeek.WEDNESDAY,
    3: DayOfWeek.THURSDAY,
    4: DayOfWeek.FRIDAY,
    5: DayOfWeek.SATURDAY,
    6: DayOfWeek.SUNDAY
});


const SettingRowOrder = Object.freeze({
    REFRESH_INTERVAL: 0,
    DISPLAY_MODE: 1,
    RESET_SCHEDULE: 2,
    RESET_WEEK_DAY: 3,
    RESET_MONTH_DAY: 4,
    RESET_TIME: 5,
    DISPLAY_BYTES: 6,
    SHOW_ICON: 7
});

class PrefsApp {
    constructor() {
        this._rows = {};
        this.main = new Gtk.Grid({
            margin_top: 10,
            margin_bottom: 10,
            margin_start: 10,
            margin_end: 10,
            row_spacing: 12,
            column_spacing: 18,
            column_homogeneous: false,
            row_homogeneous: false
        });

        this._createRefreshIntervalControl();
        this._createDisplayModeControl();
        this._createResetScheduleControl();
        this._createResetDayOfWeekControl();
        this._createResetMonthdayControl();
        this._createResetTimeControl();
        this._createUnitToggleControl();
        this._createIconToggleControl();

        setTimeout(() => {
            this.updateControls();
        }, 100);
    }

    _addRow(label, input, row) {
        let inputWidget = input;

        if (input instanceof Gtk.Switch) {
            inputWidget = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
            addChildToBox(inputWidget, input);
        }

        if (label) {
            this.main.attach(label, 0, row, 1, 1);
            this.main.attach(inputWidget, 1, row, 1, 1);
        }
        else {
            this.main.attach(inputWidget, 0, row, 2, 1);
        }
        this._rows[row] = {label, input: inputWidget};
    }

    _hideRow(row) {
        const label = this.main.get_child_at(0, row);
        const input = this.main.get_child_at(1, row);
        //Logger.log(`${row}. label: ${label} input: ${input}`);
        if (label) {
            this.main.remove(label);
        }
        if (input) {
            this.main.remove(input);
        }
    }

    _showRow(row) {
        const { label, input } = this._rows[row];
        //Logger.log(`${row}. label: ${label} input: ${input}`);
        if (!label.parent && !input.parent) {
            this.main.attach(label, 0, row, 1, 1);
            this.main.attach(input, 1, row, 1, 1);
        }
    }

    // 1. Refresh interval control number edit box.
    _createRefreshIntervalControl() {
        const intervalLabel = new Gtk.Label({
            label: _("Refresh Interval (ms)"),
            hexpand: true,
            halign: Gtk.Align.END
        });

        this._intervalInput = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 500,
                upper: 5000,
                step_increment: 100
            })
        });
        this._addRow(intervalLabel, this._intervalInput, SettingRowOrder.REFRESH_INTERVAL);
        this.schema.bind(SettingKeys.REFRESH_INTERVAL, this._intervalInput, 'value', Gio.SettingsBindFlags.DEFAULT);
    }

    // 2. Display mode select drop down.
    _createDisplayModeControl() {
        const displayModeLabel  = new Gtk.Label({
            label: _("What to show in status bar"),
            hexpand: true,
            halign: Gtk.Align.END
        });
        const displayMode = this.schema.get_string(SettingKeys.DISPLAY_MODE);
        const displayModeIndex = kDisplayModeMapping.getIndex(displayMode);

        const options = [
            { name: _("Total speed") },
            { name: _("Upload speed") },
            { name: _("Download speed") },
            { name: _("Upload and download speed") },
            { name: _("Total data used") },
        ];

        this._displayModeInput = new Gtk.ComboBox({
            model: this._createOptionsList(options),
            active: displayModeIndex,
        });
        const rendererText = new Gtk.CellRendererText();
        this._displayModeInput.pack_start(rendererText, false);
        this._displayModeInput.add_attribute(rendererText, "text", 0);
        this._addRow(displayModeLabel, this._displayModeInput, SettingRowOrder.DISPLAY_MODE);
        this._displayModeInput.connect('changed', Lang.bind(this, this._onDisplayModeInputChanged));
    }

    // 3. Reset schedule drop down.
    _createResetScheduleControl() {
        const resetScheduleLabel  = new Gtk.Label({
            label: _("When do you want to reset the stats ?"),
            hexpand: true,
            halign: Gtk.Align.END
        });
        const resetSchedule = this.schema.get_string(SettingKeys.RESET_SCHEDULE);
        const resetScheduleIndex = kResetScheduleMapping.getIndex(resetSchedule);

        const options = [
            { name: _("Daily") },
            { name: _("Weekly") },
            { name: _("BiWeekly") },
            { name: _("Monthly") },
            { name: _("Never") },
        ];

        this._resetScheduleInput = new Gtk.ComboBox({
            model: this._createOptionsList(options),
            active: resetScheduleIndex,
        });
        const rendererText = new Gtk.CellRendererText();
        this._resetScheduleInput.pack_start(rendererText, false);
        this._resetScheduleInput.add_attribute(rendererText, "text", 0);
        this._addRow(resetScheduleLabel, this._resetScheduleInput, SettingRowOrder.RESET_SCHEDULE);
        this._resetScheduleInput.connect('changed', Lang.bind(this, this._onResetScheduleInputChanged));
    }

    // 4. Reset on day of week, in case week is selected.
    _createResetDayOfWeekControl() {
        const resetOnDayOfWeekLabel  = new Gtk.Label({
            label: _("Reset on day of week"),
            hexpand: true,
            halign: Gtk.Align.END
        });
        const resetDayOfWeek = this.schema.get_string(SettingKeys.RESET_WEEK_DAY);
        const resetDayOfWeekIndex = kDayOfWeekMapping.getIndex(resetDayOfWeek);

        const options = [
            { name: _("Monday") },
            { name: _("Tuesday") },
            { name: _("Wednesday") },
            { name: _("Thursday") },
            { name: _("Friday") },
            { name: _("Saturday") },
            { name: _("Sunday") },
        ];

        this._resetDayOfWeekInput = new Gtk.ComboBox({
            model: this._createOptionsList(options),
            active: resetDayOfWeekIndex,
        });
        const rendererText = new Gtk.CellRendererText();
        this._resetDayOfWeekInput.pack_start(rendererText, false);
        this._resetDayOfWeekInput.add_attribute(rendererText, "text", 0);
        this._addRow(resetOnDayOfWeekLabel, this._resetDayOfWeekInput, SettingRowOrder.RESET_WEEK_DAY);
        this._resetDayOfWeekInput.connect('changed', Lang.bind(this, this._onResetDayOfWeekInputChanged));
    }

    // 5. Day of month when Month is selected in reset schedule.
    _createResetMonthdayControl() {
        const resetOnDayOfMonthLabel = new Gtk.Label({
            label: _("Reset on day of month"),
            hexpand: true,
            halign: Gtk.Align.END
        });

        this._resetOnDayOfMonthInput = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 31,
                step_increment: 1
            })
        });
        this._addRow(resetOnDayOfMonthLabel, this._resetOnDayOfMonthInput, SettingRowOrder.RESET_MONTH_DAY);
        this.schema.bind(SettingKeys.RESET_MONTH_DAY, this._resetOnDayOfMonthInput, 'value', Gio.SettingsBindFlags.DEFAULT);
    }

    // 6. Reset time Spin button control.
    _createResetTimeControl() {
        const resetTimeLabel  = new Gtk.Label({
            label: _("What time should we reset network stats"),
            hexpand: true,
            halign: Gtk.Align.END
        });
        this._resetHoursInput = new Gtk.SpinButton({
            wrap: true,
            numeric: true,
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 23,
                step_increment: 1
            }),
            orientation: Gtk.Orientation.VERTICAL
        });
        const timeSeparatorLabel = new Gtk.Label({
            label: ":",
            hexpand: false,
            halign: Gtk.Align.CENTER,
            use_markup: true
        })
        this._resetMinutesInput = new Gtk.SpinButton({
            wrap: true,
            numeric: true,
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 59,
                step_increment: 1,
            }),
            orientation: Gtk.Orientation.VERTICAL
        });

        const resetTimeWidget = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        addChildToBox(resetTimeWidget, this._resetHoursInput);
        addChildToBox(resetTimeWidget, timeSeparatorLabel);
        addChildToBox(resetTimeWidget, this._resetMinutesInput);

        this._addRow(resetTimeLabel, resetTimeWidget, SettingRowOrder.RESET_TIME);
        this.schema.bind(SettingKeys.RESET_HOURS, this._resetHoursInput, 'value', Gio.SettingsBindFlags.DEFAULT);
        this.schema.bind(SettingKeys.RESET_MINUTES, this._resetMinutesInput, 'value', Gio.SettingsBindFlags.DEFAULT);
    }

    // 7. Show numbers in bytes instead of bits
    _createUnitToggleControl() {
        const unitLabel = new Gtk.Label({
            label: _("Show speeds in bytes instead of bits"),
            hexpand: true,
            halign: Gtk.Align.END
        });

        this._unitSwitch = new Gtk.Switch({
            halign: Gtk.Align.END,
            visible: true
        });
        this._addRow(unitLabel, this._unitSwitch, SettingRowOrder.DISPLAY_BYTES);
        this.schema.bind(SettingKeys.DISPLAY_BYTES, this._unitSwitch, 'state', Gio.SettingsBindFlags.DEFAULT);
    }

    // 8. Show icon in status bar
    _createIconToggleControl() {
        const iconLabel = new Gtk.Label({
            label: _("Show icon in status bar (requires reload)"),
            hexpand: true,
            halign: Gtk.Align.END
        });

        this._iconSwitch = new Gtk.Switch({
            halign: Gtk.Align.END,
            visible: true
        });
        this._addRow(iconLabel, this._iconSwitch, SettingRowOrder.SHOW_ICON);
        this.schema.bind(SettingKeys.SHOW_ICON, this._iconSwitch, 'state', Gio.SettingsBindFlags.DEFAULT);
    }

    _createOptionsList(options) {
        const liststore = new Gtk.ListStore();
        liststore.set_column_types([GObject.TYPE_STRING])
        for (let i = 0; i < options.length; i++ ) {
            const option = options[i];
            const iter = liststore.append();
            liststore.set(iter, [0], [option.name]);
        }
        return liststore;
    }

    _onDisplayModeInputChanged(view) {
        const index = view.get_active();
        const mode = kDisplayModeMapping.getValue(index);
        this.schema.set_string(SettingKeys.DISPLAY_MODE, mode);
    }

    _onResetScheduleInputChanged(view) {
        const index = view.get_active();
        const mode = kResetScheduleMapping.getValue(index);
        this.schema.set_string(SettingKeys.RESET_SCHEDULE, mode);
        this.updateControls();
    }

    _onResetDayOfWeekInputChanged(view) {
        const index = view.get_active();
        const mode = kDayOfWeekMapping.getValue(index);
        this.schema.set_string(SettingKeys.RESET_WEEK_DAY, mode);
    }

    updateControls() {
        const resetSchedule = this.schema.get_string(SettingKeys.RESET_SCHEDULE);
        //Logger.log(`resetSchedule: ${resetSchedule}`);
        switch(resetSchedule) {
            default:
            case ResetSchedule.DAILY:
                this._hideRow(SettingRowOrder.RESET_WEEK_DAY);
                this._hideRow(SettingRowOrder.RESET_MONTH_DAY);
                this._showRow(SettingRowOrder.RESET_TIME);
                break;
            case ResetSchedule.WEEKLY:
            case ResetSchedule.BIWEEKLY:
                this._showRow(SettingRowOrder.RESET_WEEK_DAY);
                this._hideRow(SettingRowOrder.RESET_MONTH_DAY);
                this._showRow(SettingRowOrder.RESET_TIME);
                break;
            case ResetSchedule.MONTHLY:
                this._hideRow(SettingRowOrder.RESET_WEEK_DAY);
                this._showRow(SettingRowOrder.RESET_MONTH_DAY);
                this._showRow(SettingRowOrder.RESET_TIME);
                break;
            case ResetSchedule.NEVER:
                this._hideRow(SettingRowOrder.RESET_WEEK_DAY);
                this._hideRow(SettingRowOrder.RESET_MONTH_DAY);
                this._hideRow(SettingRowOrder.RESET_TIME);
                break;
        }
    }

    get schema() {
        if (!this._schema) {
            const schemaDir = Me.dir.get_child('schemas').get_path();
            const schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir, Gio.SettingsSchemaSource.get_default(), false);
            const schema = schemaSource.lookup(kSchemaName, false);
            this._schema = new Gio.Settings({ settings_schema: schema });
        }
        return this._schema;
    }
}


/** Initialize language/locale  */
function init() {
    Logger.debug("init");
    const localeDir = Me.dir.get_child("locale");
    if (localeDir.query_exists(null)) {
        Gettext.bindtextdomain("network-stats", localeDir.get_path());
    }
}

/** Build settings view */
function buildPrefsWidget() {
    Logger.debug("buildPrefsWidget");
    const widget = new PrefsApp();
    if (isGtk3()) {
        widget.main.show_all();
    }
    return widget.main;
};