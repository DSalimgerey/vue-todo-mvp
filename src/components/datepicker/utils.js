import dayjs from 'dayjs'
import isBetweenPlugin from 'dayjs/plugin/isBetween'

dayjs.extend(isBetweenPlugin)

import { isArray } from '../../utils'

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

export const toDate = (value) => dayjs(value).toDate()

export const format = (date, template) => dayjs(date).format(template)

export const isBetween = (date, start, end, unit = 'date') =>
  dayjs(date).isBetween(dayjs(start).subtract(1, 'day'), dayjs(end).add(1, 'day'), unit)
