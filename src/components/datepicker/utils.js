import dayjs from 'dayjs'
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
