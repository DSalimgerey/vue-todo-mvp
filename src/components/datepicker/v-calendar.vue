<script>
import dayjs from 'dayjs'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { DAYS_AMOUNT_OF_CALENDAR, WEEKDAYS } from '../../utils/constants'
import { isSame, format, toDate } from './utils'

export default {
  name: 'v-calendar',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon
  },

  props: {
    value: {
      type: Date,
      default: () => new Date()
    }
  },

  emits: ['select'],

  data() {
    const weekdays = WEEKDAYS
    return {
      activeDate: new Date(),
      now: new Date(),
      weekdays
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
        this.activeDate = value
      },
      immediate: true
    }
  },

  methods: {
    isSame,
    prev() {
      this.activeDate = dayjs(this.activeDate).clone().subtract(1, 'month')
    },
    toCurrentMonth() {
      this.activeDate = toDate(dayjs())
    },
    next() {
      this.activeDate = dayjs(this.activeDate).clone().add(1, 'month')
    },
    select(date) {
      this.$emit('select', date)
    }
  }
}
</script>

<template>
  <div class="v-calendar">
    <div class="v-calendar__header">
      <span class="v-calendar__label">{{ label }}</span>
      <div class="v-calendar__actions-wrapper">
        <button @click="prev">
          <chevron-left-icon class="w-[12px] h-[12px] text-gray-500"></chevron-left-icon>
        </button>
        <button @click="toCurrentMonth">
          <div class="w-[12px] h-[12px] rounded-full border border-gray-400"></div>
        </button>
        <button @click="next">
          <chevron-right-icon class="w-[12px] h-[12px] text-gray-500"></chevron-right-icon>
        </button>
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
            'v-calendar__day--selected': isSame(day.Date, value)
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
  @apply flex items-center justify-between mb-[4px];
}
.v-calendar__label {
  @apply text-[12px] font-bold;
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
.v-calendar__day--today {
  @apply border-gray-400 rounded-[2px];
}
.v-calendar__day--outside {
  @apply text-gray-400;
}
.v-calendar__day--selected {
  @apply text-white !bg-sky-600 !rounded-[2px] !border-[transparent];
}
</style>
