<script>
import { ref } from 'vue'
import dayjs from 'dayjs'
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
  ENTER
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
  setToDate,
  isValid
} from '../../utils'

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
        Array.isArray(value)
          ? value.every((v) => isValid(v, BASE_DATE_FORMAT))
          : isValid(value, BASE_DATE_FORMAT)
    },
    isRange: {
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
    const values = ref({
      start: isArray(props.value) ? props.value[0] : props.value,
      end: isArray(props.value) ? props.value[1] : props.value
    })

    const incorrectDateErrorMessage = props.isRange ? 'invalid range' : 'invalid date'
    const { handleSubmit, setValues, setFieldValue } = useForm({
      initialValues: values
    })
    const { value: startValue, errorMessage: startValueErrorMessage } = useField(
      'start',
      validator('range-start', incorrectDateErrorMessage, BASE_DATE_FORMAT),
      { validateOnValueUpdate: false }
    )
    const { value: endValue, errorMessage: endValueErrorMessage } = useField(
      'end',
      validator('range-end', incorrectDateErrorMessage, BASE_DATE_FORMAT),
      { validateOnValueUpdate: false }
    )

    const onSubmit = handleSubmit((formValues) => {
      if (props.isRange) {
        if (isRangeStartFocused.value) {
          const startValue = formValues.start
          if (
            isBefore(startValue, activeDate.value, 'year') ||
            isAfter(startValue, activeDate.value, 'year')
          ) {
            const updatedEndValue = setToDate(
              values.value.end,
              'year',
              toDate(startValue).getFullYear()
            ).format(BASE_DATE_FORMAT)
            const updatedValues = { start: startValue, end: updatedEndValue }
            values.value = updatedValues
            setValues(updatedValues)
          } else {
            values.value = formValues
          }
        } else {
          values.value = formValues
        }
      }

      const dates = Object.values(formValues)
      ctx.emit('update:value', isArray(props.value) ? dates : dates[0])
    })

    return {
      activeDate,
      isRangeStartFocused,
      isRangeEndFocused,
      values,
      startValue,
      startValueErrorMessage,
      endValue,
      endValueErrorMessage,
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
          isToday: isSame(dayjs(this.startDate).add(i, 'day'), this.now),
          isOutside: !isSame(dayjs(this.startDate).add(i, 'day'), this.activeDate, 'month'),
          Date: dayjs(this.startDate).add(i, 'day').toDate()
        })
      }

      return days
    }
  },

  watch: {
    value: {
      handler(value) {
        this.activeDate = isArray(value) ? (this.isRangeStartFocused ? value[0] : value[1]) : value
      },
      immediate: true
    },
    isRange: {
      handler(value) {
        if (value) {
          if (isArray(this.value)) {
            // o is object with two properties which has as values formatted
            // date strings : { start: BASE_DATE_FORMAT, end: BASE_DATE_FORMAT }
            const o = this.value.reduce((acc, d, i) => {
              // if some how props.value has more than two elements, as object property values
              // should be returned first and second array element and others should be skipped
              return i > 1
                ? acc
                : {
                    ...acc,
                    [i <= 0 ? 'start' : 'end']: dayjs(d).format(BASE_DATE_FORMAT)
                  }
            }, {})
            this.values = o
            this.setValues(o)
            this.activeDate = dayjs(o.start, BASE_DATE_FORMAT).toDate()
          } else {
            const formattedValue = format(this.value, BASE_DATE_FORMAT)
            this.values = { start: formattedValue, end: formattedValue }
            this.setValues({ start: formattedValue, end: formattedValue })
            this.activeDate = this.value
          }
          this.submitRanges()
          this.focusRangeInput(this.$refs.end).then(() => this.focusRangeEnd())
        } else {
          this.$emit('update:value', isArray(this.value) ? this.value[0] : this.value)
        }
      }
    }
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
        if (isSame(this.values.start, date)) {
          this.focusRangeStart()
        } else if (isSame(this.values.end, date)) {
          this.focusRangeEnd()
        } else {
          if (this.isRangeStartFocused) {
            this.updateRangeStart(date)
          } else {
            this.updateRangeEnd(date)
          }
          this.submitRanges()
        }
        this.activeDate = toDate(date)
      } else {
        this.updateRangeStart(date)
        this.$emit('update:value', date)
      }
    },
    submitRanges() {
      const dates = Object.values(this.values)
      this.$emit('update:value', dates)
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
        this.activeDate = dayjs(this.values.start, BASE_DATE_FORMAT).toDate()
      }
    },
    focusRangeEnd() {
      this.isRangeEndFocused = true
      this.isRangeStartFocused = false
      if (this.isRange) {
        this.activeDate = dayjs(this.values.end, BASE_DATE_FORMAT).toDate()
      }
    },
    updateRangeStart(value) {
      if (this.isRange) {
        if (isAfter(value, this.values.end)) {
          // todo: in this moment current value of first input should be replaced by
          // current value of second input after 'value' should be passed into 'updateRangeEnd'
          this.updateRangeEnd(value)
          this.focusRangeEnd()
        } else {
          this.values.start = value
          this.setFieldValue('start', value)
        }
      } else {
        this.values.start = value
        this.setFieldValue('start', value)
      }
    },
    updateRangeEnd(value) {
      if (isBefore(value, this.values.start)) {
        this.updateRangeStart(value)
        this.focusRangeStart()
      } else {
        this.values.end = value
        this.setFieldValue('end', value)
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

      // const value = e.target.value

      // // so that when you enter and change the start date, the number of days between
      // // the start and end of the range remains the same
      // // for example, the next date is selected as the value of the range - 12 / 15
      // // (there are two days between the two ends of the range: 13 and 14), if the start is changed to 14,
      // // the number of intermediate days will remain (2 days), and the end will shift by 17 (from 15)

      // if (this.$refs.start === e.target) {
      //   const diff = Math.abs(dayjs(value).diff(this.range.start, 'day'))
      //   const addOrSubtract = isBefore(value, this.range.start) ? 'subtract' : 'add'

      //   const updatedRangeEndDateWithDiff = dayjs(this.range.end)
      //     [addOrSubtract](diff, 'day')
      //     .format(BASE_DATE_FORMAT)

      //   this.range.start = value
      //   this.range.end = updatedRangeEndDateWithDiff
      // } else {
      //   this.isRangeStartFocused ? this.updateRangeStart(value) : this.updateRangeEnd(value)
      // }

      // this.submitRanges()
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
          class="w-[fit-content] grid gap-[4px]"
          :class="[isRange ? 'grid-cols-2' : 'grid-cols-1']"
        >
          <div
            class="w-[fit-content] flex flex-col"
            :class="[isRange ? 'w-[fit-content]' : 'w-[168px]']"
          >
            <input
              v-model="startValue"
              ref="start"
              class="h-[22px] border border-gray-400 rounded-[4px] focus:outline-none text-[12px] px-[4px] focus:ring-2"
              :class="[
                isRange ? 'w-[82px]' : 'w-full',
                {
                  'border-sky-600 bg-blue-500/5 focus:border-sky-600 ring-blue-500/10':
                    isRangeStartFocused,
                  'border-red-500 bg-red-500/5 focus:border-red-500 ring-red-500/10':
                    startValueErrorMessage
                }
              ]"
              type="text"
              :placeholder="isRange ? 'Start date' : 'Date'"
              @focus="focusRangeStart"
              @blur="onSubmit"
              @keydown.enter="onSubmit"
            />
            <span v-show="startValueErrorMessage" class="text-[12px] text-red-500 mt-[4px]">{{
              startValueErrorMessage
            }}</span>
          </div>
          <div v-if="isRange" class="w-[fit-content] flex flex-col">
            <input
              v-model="endValue"
              ref="end"
              class="w-[82px] h-[22px] border border-gray-400 rounded-[4px] focus:outline-none text-[12px] px-[4px] focus:ring-2"
              :class="[
                {
                  'border-sky-600 bg-blue-500/5 focus:border-sky-600 ring-blue-500/10':
                    isRangeEndFocused,
                  'border-red-500 bg-red-500/5 focus:border-red-500 ring-red-500/10':
                    endValueErrorMessage
                }
              ]"
              type="text"
              placeholder="End date"
              @focus="focusRangeEnd"
              @blur="onSubmit"
              @keydown.enter="onSubmit"
            />
            <span v-show="endValueErrorMessage" class="text-[12px] text-red-500 mt-[4px]">{{
              endValueErrorMessage
            }}</span>
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
            'v-calendar__day--range-start': isRange && isSame(day.Date, values.start),
            'v-calendar__day--range': isRange && isBetween(day.Date, values.start, values.end),
            'v-calendar__day--range-end': isRange && isSame(day.Date, values.end),
            'v-calendar__day--range-start-focused':
              isRange && isRangeStartFocused && isSame(day.Date, values.start),
            'v-calendar__day--range-end-focused':
              isRange && isRangeEndFocused && isSame(day.Date, values.end),
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
  @apply w-[24px] h-[24px] text-[12px] flex items-center justify-center hover:bg-gray-100 hover:rounded-[2px] border border-[transparent] leading-3 text-dark-900 outline-none ring-blue-100;
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
  @apply border-sky-600 rounded-[2px] ring ring-[2px] ring-sky-600/10 !bg-sky-600/10;
}

.v-calendar__day--range-start {
  @apply !bg-sky-600/60 text-dark-900 !border-[transparent];
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}
.v-calendar__day--range-end {
  @apply !bg-sky-600/60 text-dark-900 !border-[transparent];
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
