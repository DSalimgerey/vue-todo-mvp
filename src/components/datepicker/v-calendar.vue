<script>
import { nextTick, ref, watch } from 'vue'
import dayjs from 'dayjs'
import isTodayPlugin from 'dayjs/plugin/isToday'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useField, useForm } from 'vee-validate'
import * as yup from 'yup'
import {
  DAYS_AMOUNT_OF_CALENDAR,
  WEEKDAYS,
  BASE_DATE_FORMAT,
  ARROW_UP,
  ARROW_RIGHT,
  ARROW_DOWN,
  ARROW_LEFT,
  ENTER,
  HHMM,
  DEFAULT_TIME
} from '../../utils/constants'
import {
  focus,
  stopEvent,
  isArray,
  isSame,
  format,
  toDate,
  isBetween,
  isAfter,
  isBefore,
  isValid,
  values
} from '../../utils'

dayjs.extend(isTodayPlugin)

function dateTimeSplitter(value) {
  const dates = []
  const times = []
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i].includes(':')) {
        times.push(value[i].split(' ')[1])
      }
      dates.push(value[i].split(' ')[0])
    }
  } else {
    if (value.includes(':')) {
      times.push(value.split(' ')[1])
    }
    dates.push(value.split(' ')[0])
  }
  return [dates, times]
}

const stringify = (o, range = false, time = false) => {
  const initialValue = range ? [] : ''
  const separator = time ? ' ' : ''
  return values(o).reduce((acc, v, i, arr) => {
    return range
      ? acc.concat(values(time ? v : arr[i].date).join(separator))
      : values(time ? arr[0] : arr[0].date).join(separator)
  }, initialValue)
}

const validator = (name, message, format = BASE_DATE_FORMAT) => {
  return yup.string().test(name, message, function (value) {
    const { path, createError } = this
    return isValid(value, format, true) || createError({ path, message })
  })
}

export default {
  name: 'v-calendar',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon
  },

  props: {
    value: {
      type: [String, Array],
      required: true,
      validation: (value) =>
        isArray(value)
          ? value.every((v) => isValid(v, BASE_DATE_FORMAT))
          : isValid(value, BASE_DATE_FORMAT)
    },
    isRange: {
      type: Boolean,
      required: false,
      default: false
    },
    isTime: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  emits: ['update:value'],

  setup(props, ctx) {
    const activeDate = ref(new Date())
    const isRangeStartFocused = ref(false)
    const isRangeEndFocused = ref(false)

    const endRef = ref(null)

    const [dates, times] = dateTimeSplitter(props.value)
    const values = ref({
      start: {
        date: dates[0],
        time: times.length ? times[0] : DEFAULT_TIME
      },
      end: {
        date: dates[1] ? dates[1] : dates[0],
        time: times[1] !== undefined ? times[1] : times[0] ? times[0] : DEFAULT_TIME
      }
    })

    const incorrectDateErrorMessage = props.isRange ? 'invalid range' : 'invalid date'
    const incorrectTimeErrorMessage = 'invalid time'

    const { handleSubmit, setValues, setFieldValue, setFieldError } = useForm({
      initialValues: values
    })
    const { value: startValue, errorMessage: startValueErrorMessage } = useField(
      'start.date',
      validator('start-date', incorrectDateErrorMessage, BASE_DATE_FORMAT),
      { validateOnValueUpdate: false }
    )
    const { value: endValue, errorMessage: endValueErrorMessage } = useField(
      'end.date',
      validator('end-date', incorrectDateErrorMessage, BASE_DATE_FORMAT),
      { validateOnValueUpdate: false }
    )
    const { value: startTime, errorMessage: startTimeErrorMessage } = useField(
      'start.time',
      validator('start-time', incorrectTimeErrorMessage, HHMM),
      { validateOnValueUpdate: false }
    )
    const { value: endTime, errorMessage: endTimeErrorMessage } = useField(
      'end.time',
      validator('end-time', incorrectTimeErrorMessage, HHMM),
      { validateOnValueUpdate: false }
    )

    const onSubmit = handleSubmit((formValues) => {
      if (props.isRange) {
        if (isRangeStartFocused.value) {
          const startValue = formValues.start.date
          if (
            isBefore(startValue, activeDate.value, 'year') ||
            isAfter(startValue, activeDate.value, 'year')
          ) {
            const updatedEndValue = dayjs(values.value.end.date)
              .set('year', toDate(startValue).getFullYear())
              .format(BASE_DATE_FORMAT)
            values.value.start.date = startValue
            values.value.end.date = updatedEndValue
            setFieldValue('start.date', startValue)
            setFieldValue('end.date', updatedEndValue)
          } else if (isSame(values.value.start.date, values.value.end.date, 'date')) {
            values.value.start.date = values.value.end.date = startValue
            setFieldValue('start.date', startValue)
            setFieldValue('end.date', startValue)
          } else {
            // So that when user enter and change the start date, the number of days between
            // the start and end of the range remains the same. For example, the next date
            // is selected as the value of the range - 12 / 15 (there are two days between
            // the two ends of the range: 13 and 14), if the start is changed to 14,
            // the number of intermediate days will remain (2 days), and the end will shift by 17 (from 15)
            // and vice versa, when start date is changed from 12 to 10 or 9. End date should be
            // shifted from 15 to 13 or 12

            const diff = Math.abs(dayjs(startValue).diff(values.value.start.date, 'day'))
            const addOrSubtract = isBefore(startValue, values.value.start.date) ? 'subtract' : 'add'

            const updatedEndDateWithDiff = dayjs(values.value.end.date)
              [addOrSubtract](diff, 'day')
              .format(BASE_DATE_FORMAT)

            values.value.start.date = startValue
            values.value.end.date = updatedEndDateWithDiff
            setFieldValue('start.date', startValue)
            setFieldValue('end.date', updatedEndDateWithDiff)
          }

          values.value = isSame(values.value.start.date, values.value.end.date, 'date')
            ? values.value
            : formValues
        } else {
          if (isBefore(formValues.end.date, values.value.start.date)) {
            setFieldError('end.date', 'invalid range')
          } else {
            values.value = formValues
          }
        }
      } else {
        values.value = formValues
      }

      const value = stringify(values.value, props.isRange, props.isTime)
      ctx.emit('update:value', value)
    })

    watch(
      () => props.value,
      (value) => {
        activeDate.value = toDate(
          isArray(value) ? (isRangeStartFocused.value ? value[0] : value[1]) : value,
          BASE_DATE_FORMAT
        )
      },
      { immediate: true }
    )

    watch(
      () => props.isRange,
      (value) => {
        if (value) {
          values.value.end.date = values.value.start.date
          setFieldValue('end.date', values.value.start.date)
        }
        ctx.emit('update:value', stringify(values.value, props.isRange, props.isTime))
        nextTick(() => {
          endRef.value.focus()
        })
      }
    )

    watch(
      () => props.isTime,
      (value) => {
        if (!value) {
          values.value.start.time = DEFAULT_TIME
          values.value.end.time = DEFAULT_TIME
          setFieldValue('start.time', DEFAULT_TIME)
          setFieldValue('end.time', DEFAULT_TIME)
        }
        ctx.emit('update:value', stringify(values.value, props.isRange, value))
      },
      { immediate: true }
    )

    return {
      activeDate,
      isRangeStartFocused,
      isRangeEndFocused,
      values,
      startValue,
      startValueErrorMessage,
      endValue,
      endValueErrorMessage,
      startTime,
      startTimeErrorMessage,
      endTime,
      endTimeErrorMessage,
      endRef,
      onSubmit,
      setValues,
      setFieldValue
    }
  },

  data() {
    const weekdays = WEEKDAYS

    return {
      now: new Date(),
      weekdays,
      isCalendarFocused: false
    }
  },

  computed: {
    label() {
      return `${format(this.activeDate, 'MMMM')} ${format(this.activeDate, 'YYYY')}`
    },
    startDate() {
      return dayjs(this.activeDate).date(0).day(1)
    },
    calendar() {
      const days = []

      for (let i = 0; i < DAYS_AMOUNT_OF_CALENDAR; i++) {
        days.push({
          date: dayjs(this.startDate).add(i, 'day').format('D'),
          month: dayjs(this.startDate).add(i, 'day').format('M'),
          year: dayjs(this.startDate).add(i, 'day').format('YYYY'),
          isToday: dayjs(this.startDate).add(i, 'day').isToday(),
          isOutside: !isSame(dayjs(this.startDate).add(i, 'day'), this.activeDate, 'month'),
          Date: dayjs(this.startDate).add(i, 'day').toDate()
        })
      }

      return days
    }
  },

  watch: {
    // isRange: {
    //   handler(value) {
    //     if (value) {
    //       if (isArray(this.value)) {
    //         // o is object with two properties which has as values formatted
    //         // date strings : { start: BASE_DATE_FORMAT, end: BASE_DATE_FORMAT }
    //         const o = this.value.reduce((acc, d, i) => {
    //           // if some how props.value has more than two elements, as object property values
    //           // should be returned first and second array element and others should be skipped
    //           return i > 1
    //             ? acc
    //             : {
    //                 ...acc,
    //                 [i <= 0 ? 'start' : 'end']: dayjs(d).format(BASE_DATE_FORMAT)
    //               }
    //         }, {})
    //         this.values = o
    //         this.setValues(o)
    //         this.activeDate = dayjs(o.start, BASE_DATE_FORMAT).toDate()
    //         console.log(this.activeDate)
    //       } else {
    //         const formattedValue = format(this.value, BASE_DATE_FORMAT)
    //         this.values = { start: formattedValue, end: formattedValue }
    //         this.setValues({ start: formattedValue, end: formattedValue })
    //         this.activeDate = this.value
    //       }
    //       this.submitRanges()
    //       this.focusRangeInput(this.$refs.end).then(() => this.focusRangeEnd())
    //     } else {
    //       this.$emit('update:value', isArray(this.value) ? this.value[0] : this.value)
    //     }
    //   }
    // }
  },

  mounted() {
    this.focusRangeInput(this.$refs.start).then(() => this.focusRangeStart())
    document.addEventListener('click', this.focusCalendar)
    document.addEventListener('keydown', this.onKeydown)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.focusCalendar)
    document.removeEventListener('keydown', this.onKeydown)
  },

  methods: {
    isSame,
    isBetween,
    formatDate(value) {
      return format(value, BASE_DATE_FORMAT)
    },
    prev() {
      this.activeDate = dayjs(this.activeDate).subtract(1, 'month').toDate()
    },
    toCurrentMonth() {
      this.activeDate = toDate(dayjs())
    },
    next() {
      this.activeDate = dayjs(this.activeDate).add(1, 'month').toDate()
    },
    select(date) {
      date = format(date, BASE_DATE_FORMAT)

      if (this.isRange) {
        if (isSame(this.values.start.date, date)) {
          this.focusRangeStart()
        } else if (isSame(this.values.end.date, date)) {
          this.focusRangeEnd()
        } else {
          if (this.isRangeStartFocused) {
            this.updateRangeStart(date)
          } else {
            this.updateRangeEnd(date)
          }
        }
        this.activeDate = toDate(date)
      } else {
        this.updateRangeStart(date)
      }
      const value = stringify(this.values, this.isRange, this.isTime)
      this.$emit('update:value', value)
    },
    async focusRangeInput(ref) {
      this.$nextTick(() => {
        focus(ref)
      })
    },
    focusRangeStart() {
      this.isRangeStartFocused = true
      this.isRangeEndFocused = false
      if (this.isRange) {
        this.activeDate = dayjs(this.values.start.date, BASE_DATE_FORMAT).toDate()
      }
    },
    focusRangeEnd() {
      this.isRangeEndFocused = true
      this.isRangeStartFocused = false
      if (this.isRange) {
        this.activeDate = dayjs(this.values.end.date, BASE_DATE_FORMAT).toDate()
      }
    },
    updateRangeStart(value) {
      if (this.isRange) {
        if (isAfter(value, this.values.end.date)) {
          this.values.start.date = this.values.end.date
          this.setFieldValue('start.date', this.values.end.date)
          this.updateRangeEnd(value)
          this.focusRangeEnd()
        } else {
          this.values.start.date = value
          this.setFieldValue('start.date', value)
        }
      } else {
        this.values.start.date = value
        this.setFieldValue('start.date', value)
      }
    },
    updateRangeEnd(value) {
      if (isBefore(value, this.values.start.date)) {
        this.updateRangeStart(value)
        this.focusRangeStart()
      } else {
        this.values.end.date = value
        this.setFieldValue('end.date', value)
      }
    },
    onKeydown(e) {
      if (this.isCalendarFocused) {
        switch (e.code) {
          case ARROW_UP:
            this.activeDate = dayjs(this.activeDate).subtract(7, 'day').toDate()
            break
          case ARROW_RIGHT:
            this.activeDate = dayjs(this.activeDate).add(1, 'day').toDate()
            break
          case ARROW_DOWN:
            this.activeDate = dayjs(this.activeDate).add(7, 'day').toDate()
            break
          case ARROW_LEFT:
            this.activeDate = dayjs(this.activeDate).subtract(1, 'day').toDate()
            break
          case ENTER:
            stopEvent(e)
            this.select(this.activeDate)
        }
      }
    },
    focusCalendar(e) {
      if (e.target.hasAttribute('data-date')) {
        this.isCalendarFocused = true
      } else {
        this.isCalendarFocused = false
      }
    }
  }
}
</script>

<template>
  <div class="v-calendar">
    <div class="v-calendar__header">
      <div class="mb-[6px]">
        <div
          class="w-[168px] grid gap-[4px]"
          :class="[
            isRange
              ? isTime
                ? 'grid-rows-auto grid-cols-1'
                : 'grid-rows-1 grid-cols-2'
              : 'grid-rows-1 grid-cols-1'
          ]"
        >
          <!-- start range input -->
          <div
            class="w-[168px] h-[fit-content] flex flex-col"
            :class="[
              startValueErrorMessage || startTimeErrorMessage ? 'h-[fit-content]' : 'h-[22px]'
            ]"
          >
            <div
              class="h-[22px] flex items-center border rounded-[3px]"
              :class="[
                isRange && isRangeStartFocused
                  ? 'border-sky-600 bg-blue-500/5 ring-blue-500/10 focus-within:ring-2'
                  : 'bg-gray-50 border-gray-400',
                isRange ? (isTime ? 'w-full' : 'w-[82px]') : 'w-full',
                {
                  'border-red-500 bg-red-500/5 focus:border-red-500 ring-red-500/10':
                    startValueErrorMessage || startTimeErrorMessage
                }
              ]"
            >
              <input
                v-model="startValue"
                ref="start"
                class="bg-[transparent] focus:outline-none text-[12px] px-[4px]"
                :class="[isRange ? (isTime ? 'w-full' : 'w-[82px]') : 'w-full']"
                type="text"
                :placeholder="isRange ? 'Start date' : 'Date'"
                @focus="focusRangeStart"
                @blur="onSubmit"
                @keydown.enter="onSubmit"
              />
              <div v-if="isTime" class="w-[1px] h-[14px] bg-gray-400 z-2"></div>
              <input
                v-if="isTime"
                v-model="startTime"
                class="w-[82px] bg-[transparent] focus:outline-none text-[12px] px-[4px]"
                type="text"
                @focus="focusRangeStart"
                @blur="onSubmit"
                @keydown.enter="onSubmit"
              />
            </div>

            <div
              v-if="startValueErrorMessage || startTimeErrorMessage"
              class="grid mt-[4px]"
              style="grid-template-columns: repeat(2, 84px)"
            >
              <span class="text-[11px] text-red-500">{{ startValueErrorMessage }}</span>

              <span class="text-[11px] text-red-500">{{ startTimeErrorMessage }}</span>
            </div>
          </div>

          <!-- end range input -->
          <div
            v-if="isRange"
            class="w-[fit-content] h-[fit-content] flex flex-col"
            :class="
              ([isRange ? 'w-[fit-content]' : 'w-[168px]'],
              endValueErrorMessage || endTimeErrorMessage ? 'h-[fit-content]' : 'h-[22px]')
            "
          >
            <div
              class="w-[fit-content] h-[22px] flex items-center border rounded-[3px]"
              :class="[
                isRange && isRangeEndFocused
                  ? 'border-sky-600 bg-blue-500/5 ring-blue-500/10 focus-within:ring-2'
                  : ' bg-gray-50 border-gray-400',
                isRange ? (isTime ? 'w-full' : 'w-[82px]') : 'w-full',
                {
                  'border-red-500 bg-red-500/5 focus:border-red-500 ring-red-500/10':
                    endValueErrorMessage || endTimeErrorMessage,
                  'w-full': isTime
                }
              ]"
            >
              <input
                v-model="endValue"
                ref="endRef"
                class="w-full bg-[transparent] focus:outline-none text-[12px] px-[4px]"
                type="text"
                placeholder="End date"
                @focus="focusRangeEnd"
                @blur="onSubmit"
                @keydown.enter="onSubmit"
              />
              <div v-if="isTime" class="flex w-[1px] h-[14px] bg-gray-400"></div>
              <input
                v-if="isTime"
                v-model="endTime"
                class="w-[82px] bg-[transparent] focus:outline-none text-[12px] px-[4px]"
                type="text"
                @focus="focusRangeEnd"
                @blur="onSubmit"
                @keydown.enter="onSubmit"
              />
            </div>

            <div
              v-if="endValueErrorMessage || endTimeErrorMessage"
              class="w-[fit-content] grid mt-[4px]"
              style="grid-template-columns: repeat(2, 84px)"
            >
              <span class="text-[11px] text-red-500">{{ endValueErrorMessage }}</span>

              <span class="text-[11px] text-red-500">{{ endTimeErrorMessage }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="v-calendar__label">{{ label }}</span>
        <div class="v-calendar__actions-wrapper">
          <button @click="prev">
            <chevron-left-icon class="w-[12px] h-[12px] text-gray-500"></chevron-left-icon>
          </button>
          <button @click="toCurrentMonth">
            <div class="w-[10px] h-[10px] rounded-full border border-gray-400"></div>
          </button>
          <button @click="next">
            <chevron-right-icon class="w-[12px] h-[12px] text-gray-500"></chevron-right-icon>
          </button>
        </div>
      </div>
    </div>
    <div class="v-calendar__body">
      <div class="v-calendar__weekday-list">
        <span v-for="weekday in weekdays" :key="weekday" class="v-calendar__weekday">{{
          weekday
        }}</span>
      </div>
      <div class="v-calendar__days-wrapper">
        <button
          v-for="day in calendar"
          :key="day.Date.toDateString()"
          :data-date="`${day.month}-${day.date}-${day.year}`"
          class="v-calendar__day"
          :class="{
            'v-calendar__day--today': day.isToday,
            'v-calendar__day--outside': day.isOutside,
            'v-calendar__day--selected': !isRange && isSame(day.Date, value),
            'v-calendar__day--range-start': isRange && isSame(day.Date, values.start.date),
            'v-calendar__day--range':
              isRange && isBetween(day.Date, values.start.date, values.end.date),
            'v-calendar__day--range-end': isRange && isSame(day.Date, values.end.date),
            'v-calendar__day--range-start-focused':
              isRange && isRangeStartFocused && isSame(day.Date, values.start.date),
            'v-calendar__day--range-end-focused':
              isRange && isRangeEndFocused && isSame(day.Date, values.end.date),
            'v-calendar__day--focused': isCalendarFocused && isSame(day.Date, activeDate)
          }"
          @click="select(day.Date)"
        >
          {{ day.date }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-calendar {
  @apply w-[fit-content] h-[fit-content];
}
.v-calendar__header {
  @apply flex flex-col mb-[2px];
}
.v-calendar__label {
  @apply text-[11px] font-bold;
}
.v-calendar__actions-wrapper {
  @apply flex items-center;
}
.v-calendar__weekday-list {
  @apply w-[fit-content] h-[fit-content] grid grid-rows-1 grid-cols-7 mb-[2px];
}
.v-calendar__weekday {
  @apply w-[24px] h-[24px] flex items-center justify-center text-[11px] text-gray-400;
}
.v-calendar__days-wrapper {
  @apply w-[fit-content] h-[fit-content] grid grid-rows-6 grid-cols-7;
}
.v-calendar__day {
  @apply w-[24px] h-[24px] text-[12px] flex items-center justify-center hover:bg-gray-100 hover:rounded-[2px] border border-[transparent] leading-3 text-gray-950 outline-none ring-blue-100;
}
.v-calendar__day--outside {
  @apply text-gray-400;
}
.v-calendar__day--range {
  @apply !bg-blue-500/10 !rounded-[0px];
}
.v-calendar__day--today {
  @apply !font-bold !text-sky-600;
}
.v-calendar__day--focused {
  @apply border-sky-600 rounded-[2px] ring ring-sky-600/10 !bg-sky-600/10;
}

.v-calendar__day--range-start {
  @apply !bg-sky-600/60 text-gray-950 !border-[transparent];
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}
.v-calendar__day--range-end {
  @apply !bg-sky-600/60 text-gray-950 !border-[transparent];
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}
.v-calendar__day--range-start-focused,
.v-calendar__day--range-end-focused {
  @apply !bg-sky-600 !text-white !border-[transparent];
}
.v-calendar__day--selected {
  @apply text-white !bg-sky-600 !rounded-[2px] !border-[transparent];
}
</style>
