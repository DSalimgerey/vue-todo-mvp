import { unref } from 'vue'
import dayjs from 'dayjs'
import isBetweenPlugin from 'dayjs/plugin/isBetween'
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat'
import { BASE_DATE_FORMAT } from './constants'
;[isBetweenPlugin, customParseFormatPlugin].forEach((plg) => dayjs.extend(plg))

export const isArray = (value) => Array.isArray(unref(value))

export const focus = (el) => unref(el)?.focus()

export const stopEvent = (event) => event.preventDefault()

/**
 * determines that the given date is indeed a date
 * @param {dayjs.ConfigType} date
 */
export const isDate = (date) => dayjs(date).isValid() && date instanceof Date

/**
 * determines that the given value is indeed a date range
 * @param {dayjs.ConfigType[]} range
 * @returns {boolean}
 */
export const isValidRange = (range) => isArray(range) && range.every(isDate) && range.length === 2

/**
 *
 * @param {dayjs.ConfigType} d1
 * @param {dayjs.ConfigType} d2
 * @param {dayjs.UnitType} unit
 * @returns
 */
export const isSame = (d1, d2, unit = 'date') => dayjs(d1).isSame(d2, unit)

export const toString = (date) => dayjs(date).toString()

export const toDate = (value, format) => dayjs(value, format).toDate()

export const format = (date, template) => dayjs(date).format(template)

export const isBetween = (date, start, end, unit = 'date') =>
  dayjs(date).isBetween(dayjs(start).subtract(1, 'day'), dayjs(end).add(1, 'day'), unit)

/**
 * this indicates whether the Day.js object is before the other supplied date-time.
 * @param {dayjs.ConfigType} d1
 * @param {dayjs.ConfigType} d2
 * @param {dayjs.OpUnitType} unit
 * @returns {boolean}
 */
export const isBefore = (d1, d2, unit = 'date') => dayjs(d1).isBefore(d2, unit)

/**
 * This indicates whether the Day.js object is after the other supplied date-time.
 * @param {dayjs.ConfigType} d1
 * @param {dayjs.ConfigType} d2
 * @param {dayjs.OpUnitType} unit
 * @returns {boolean}
 */
export const isAfter = (d1, d2, unit = 'date') => dayjs(d1).isAfter(d2, unit)

/**
 *
 * @param {dayjs.ConfigType} date
 * @param {string} [format=BASE_DATE_FORMAT] - as default value is used 'M-D-YYYY'
 * @param {boolean} [strict=true]
 */
export const isValid = (date, format = BASE_DATE_FORMAT, strict = true) =>
  dayjs(date, format, strict).isValid()

export const values = (o) => Object.values(o)
