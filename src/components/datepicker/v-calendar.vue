<script>
// TODO:
// (1) when user submit range end date with input and if that value is before than
// range's start date we should be show error that value is invalid

import dayjs from 'dayjs'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { DAYS_AMOUNT_OF_CALENDAR, WEEKDAYS, BASE_DATE_FORMAT } from '../../utils/constants'
import {
  isSame,
  format,
  toDate,
  isValidRange,
  isBetween,
  isAfter,
  isBefore,
  setToDate
} from './utils'
import { focus, isArray, isActiveElement } from '../../utils'

export default {
  name: 'v-calendar',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon
  },

  props: {
    value: {
      type: [Date, Array],
      required: true
    }
  },

  emits: ['select'],

  data() {
    const weekdays = WEEKDAYS
    const isRange = isArray(this.value)
    const range = {
      start: isValidRange(this.value) ? this.value[0] : new Date(),
      end: isValidRange(this.value) ? this.value[1] : new Date()
    }

    return {
      activeDate: new Date(),
      now: new Date(),
      weekdays,
      isRange,
      range,
      isRangeStartFocused: false,
      isRangeEndFocused: false
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
        this.activeDate = isArray(value) ? value[0] : value
      },
      immediate: true
    }
  },

  mounted() {
    this.focusStartRangeInput()
  },

  methods: {
    isSame,
    isBetween,
    formatDate(value) {
      return format(value, BASE_DATE_FORMAT)
    },
    prev() {
      this.activeDate = dayjs(this.activeDate).subtract(1, 'month')
    },
    toCurrentMonth() {
      this.activeDate = toDate(dayjs())
    },
    next() {
      this.activeDate = dayjs(this.activeDate).add(1, 'month')
    },
    select(date) {
      date =
        this.isRangeStartFocused || this.isRangeEndFocused ? format(date, BASE_DATE_FORMAT) : date

      if (this.isRange) {
        if (isSame(this.range.start, date)) {
          this.focusRangeStart()
        } else if (isSame(this.range.end, date)) {
          this.focusRangeEnd()
        } else {
          this.isRangeStartFocused ? this.updateRangeStart(date) : this.updateRangeEnd(date)
          this.submitRanges()
        }
      } else {
        this.$emit('select', date)
      }
    },
    submitRanges() {
      this.$emit(
        'select',
        Object.values(this.range).map((v) => toDate(v))
      )
    },
    focusStartRangeInput() {
      this.$nextTick(() => {
        const rangeStartInput = this.$refs.start

        focus(rangeStartInput)
        if (isActiveElement(rangeStartInput)) {
          this.isRangeStartFocused = true
        }
      })
    },
    focusRangeStart() {
      this.isRangeStartFocused = true
      this.isRangeEndFocused = false
    },
    focusRangeEnd() {
      this.isRangeEndFocused = true
      this.isRangeStartFocused = false
    },
    updateRangeStart(value) {
      if (isBefore(value, this.activeDate, 'year') || isAfter(value, this.activeDate, 'year')) {
        const date = setToDate(this.range.end, 'year', toDate(value).getFullYear()).toDate()

        this.range.start = value
        this.updateRangeEnd(date)
      } else if (isAfter(value, this.range.end)) {
        this.updateRangeEnd(value)
        this.focusRangeEnd()
      } else {
        this.range.start = value
      }
    },
    updateRangeEnd(value) {
      if (isBefore(value, this.range.start)) {
        this.updateRangeStart(value)
        this.focusRangeStart()
      } else {
        this.range.end = value
      }
    },
    onKeydown(e) {
      const value = e.target.value
      this.isRangeStartFocused ? this.updateRangeStart(value) : this.updateRangeEnd(value)
      this.submitRanges()
    }
  }
}
</script>

<template>
  <div class="v-calendar">
    <div class="v-calendar__header">
      <div class="mb-[6px]">
        <div v-if="isRange" class="flex">
          <input
            :value="formatDate(range.start)"
            ref="start"
            class="w-[82px] h-[22px] border border-gray-400 rounded-[4px] focus:outline-none focus:border-sky-600 text-[12px] mr-[6px] px-[4px] ring-blue-500/10 focus:ring-2"
            :class="{ 'border-sky-600 bg-blue-500/5': isRangeStartFocused }"
            type="text"
            placeholder="Date"
            @focus="focusRangeStart"
            @keydown.enter="onKeydown"
          />
          <input
            :value="formatDate(range.end)"
            ref="end"
            class="w-[82px] h-[22px] border border-gray-400 rounded-[4px] focus:outline-none focus:border-sky-600 text-[12px] px-[4px] ring-blue-500/10 focus:ring-2"
            :class="{ 'border-sky-600 bg-blue-500/5': isRangeEndFocused }"
            type="text"
            placeholder="Date"
            @focus="focusRangeEnd"
            @keydown.enter="onKeydown"
          />
        </div>
        <template v-else>
          <input
            :value="formatDate(value)"
            ref="input"
            class="w-full h-[22px] border border-gray-400 rounded-[4px] focus:outline-none focus:border-sky-600 text-[12px] mr-[6px] px-[4px] ring-blue-500/10 focus:ring-2"
            type="text"
            placeholder="Date"
          />
        </template>
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
            'v-calendar__day--range-start': isRange && isSame(day.Date, range.start),
            'v-calendar__day--range': isRange && isBetween(day.Date, range.start, range.end),
            'v-calendar__day--range-end': isRange && isSame(day.Date, range.end),
            'v-calendar__day--range-start-focused':
              isRange && isRangeStartFocused && isSame(day.Date, range.start),
            'v-calendar__day--range-end-focused':
              isRange && isRangeEndFocused && isSame(day.Date, range.end)
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
.v-calendar__day--selected {
  @apply text-white !bg-sky-600 !rounded-[2px] !border-[transparent];
}
.v-calendar__day--range {
  @apply !bg-blue-500/10 !rounded-[0px];
}
.v-calendar__day--today {
  @apply !border-gray-400 !rounded-[2px] !font-bold;
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
