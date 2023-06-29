const Mainloop = imports.mainloop;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const { ResetSchedule } = Me.imports.utils.Constants;
const { DayOfWeek } = Me.imports.utils.Constants;

const kOneDayInMilliSeconds = (1000 * 60 * 60 * 24);

/**
 * Registers a timeout handler to be executed in future.
 * @param {Function} func - function to execute after timeout.
 * @param {number} milliseconds - after which function should execute.
 * @returns handle to the registered handler
 */
function setTimeout(func, milliseconds) {
    return Mainloop.timeout_add(milliseconds, () => {
        func();
        return false;
    });
}

/**
 * Remove the registered timeout
 * @param {number} handle - handle to timeout 
 */
function clearTimeout(handle) {
    Mainloop.source_remove(handle);
}

/**
 * Converts english day name to index
 * @param {DayOfWeek} day - Day of the week in english 
 * @returns index of day starting with sunday at zero.
 */
function getDayNumberForDayOfWeek(day) {
    switch (day) {
        default:
        case DayOfWeek.SUNDAY:
            return 0;
        case DayOfWeek.MONDAY:
            return 1;
        case DayOfWeek.TUESDAY:
            return 2;
        case DayOfWeek.WEDNESDAY:
            return 3;
        case DayOfWeek.THURSDAY:
            return 4;
        case DayOfWeek.FRIDAY:
            return 5;
        case DayOfWeek.SATURDAY:
            return 6;
    }
}

/**
 * Create Date object for upcomming time, 
 * e.g. What is the Date on next/upcomming 21:30:45
 * @param {number} dayOfWeek - day of week range 0 - 6 
 * @param {boolean} excludeToday - whether to exclude today while finding next.
 * @param {Date} refDate - date WRT which we want to compute next day.
 * @returns Date object for asked upcomming time.
 */
 function getNextTimeOfTheDay(hours, minutes, refDate = new Date()) {
    if (hours < refDate.getHours()
        || (hours === refDate.getHours() && minutes <= refDate.getMinutes())
    ) {
        refDate.setDate(refDate.getDate() + 1);
    }
    refDate.setHours(hours);
    refDate.setMinutes(minutes);
    return refDate;
}

/**
 * Create Date object for upcomming given "day of week", 
 * e.g. What is the Date on next/upcomming monday
 * @param {number} dayOfWeek - day of week range 0 - 6 
 * @param {boolean} excludeToday - whether to exclude today while finding next.
 * @param {Date} refDate - date WRT which we want to compute next day.
 * @returns Date object for asked day of week.
 */
function getNextDayOfTheWeek(dayOfWeek, excludeToday = true, refDate = new Date()) {
    refDate.setDate(refDate.getDate() + !!excludeToday + 
                    (dayOfWeek + 7 - refDate.getDay() - + !!excludeToday) % 7);
    return refDate;
}

/**
 * Create Date object for given upcomming day of month, 
 * e.g. Date object for upcomming 5th on month.
 * @param {number} dayOfMonth - day of week range 1 - 31 
 * @param {boolean} excludeToday - whether to exclude today while finding next.
 * @param {Date} refDate - date WRT which we want to compute next date.
 * @returns Date object for asked day of month.
 */
function getNextDayOfTheMonth(dayOfMonth, excludeToday = true, refDate = new Date()) {
    if (dayOfMonth < refDate.getDate()
        || (dayOfMonth === refDate.getDate() && excludeToday)
    ) {
        refDate.setMonth(refDate.getMonth() + 1);
    }
    // make sure upcomming month have enough days
    const daysInMonth = daysInThisMonth(refDate.getFullYear(), refDate.getMonth());
    const day = Math.min(dayOfMonth, daysInMonth);
    refDate.setDate(day);
    return refDate;
}

/**
 * compute and returns number of days in aksed month
 * @param {number} month - ranges from 0 - 11
 * @param {number} year
 * @returns number of days in the asked month
 */
function daysInThisMonth(month, year) {
    const now = new Date();
    month = month || now.getMonth();
    year = year || now.getFullYear();
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Computes the upcomming reset point in time.
 * @param {Date} lastResetDate
 * @returns {Date} object to upcomming reset time.
 */
 function getNextResetTime(lastResetDate, settings) {
    let newResetDateTime = new Date();

    if (!lastResetDate) {
        return newResetDateTime;
    }

    const {
        resetSchedule,
        resetDayOfWeek,
        resetDayOfMonth,
        resetHours,
        resetMinutes
    } = settings;

    const lastResetDateCopy = new Date(lastResetDate.valueOf());
    switch(resetSchedule) {
        default:
        case ResetSchedule.DAILY: {
            newResetDateTime = getNextTimeOfTheDay(resetHours, resetMinutes, lastResetDateCopy);
            break;
        }
        case ResetSchedule.WEEKLY:
        case ResetSchedule.BIWEEKLY: {
            const resetDayOfWeekIndex = getDayNumberForDayOfWeek(resetDayOfWeek);
            newResetDateTime = getNextDayOfTheWeek(resetDayOfWeekIndex, true, lastResetDateCopy);
            if (resetSchedule === ResetSchedule.BIWEEKLY) {
                newResetDateTime.setDate(newResetDateTime.getDate() + 7);
            }
            break;
        }
        case ResetSchedule.MONTHLY: {
            newResetDateTime = getNextDayOfTheMonth(resetDayOfMonth, true, lastResetDateCopy);
            break;
        }
        case ResetSchedule.NEVER: {
            const oneYearFromResetTime = lastResetDate.getTime() + (365 * kOneDayInMilliSeconds);
            newResetDateTime.setTime(oneYearFromResetTime);
            break;
        }
    }

    // set the exact reset time.
    newResetDateTime.setHours(resetHours);
    newResetDateTime.setMinutes(resetMinutes);
    newResetDateTime.setSeconds(0);

    return newResetDateTime;
}