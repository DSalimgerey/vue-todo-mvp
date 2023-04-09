<script>
// TODO (feat): if in range mode both of dates is same display only time of second date-time value

import { computed, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { usePopper } from '../../composables/use-popper'
import { isArray, isValid } from '../../utils'
import VCalendar from './v-calendar.vue'
import {
  BASE_DATE_FORMAT,
  BASE_DATE_FORMAT_WITH_TIME,
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATE_FORMAT_WITH_TIME
} from '../../utils/constants'
import dayjs from 'dayjs'
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormatPlugin)

export default {
  name: 'v-datepicker',
  components: {
    VCalendar
  },

  props: {
    modelValue: {
      type: [String, Array],
      required: true,
      validation: (value) =>
        isArray(value)
          ? value.every((v) => isValid(v, BASE_DATE_FORMAT))
          : isValid(value, BASE_DATE_FORMAT)
    }
  },

  emits: {
    ['update:modelValue']: null,
    open: null,
    close: null
  },

  setup(props, ctx) {
    const date = ref(props.modelValue)
    const reference = ref(null)
    const popper = ref(null)
    const { isOpen, open, close } = usePopper(reference, popper, {
      placement: 'bottom-start',
      emit: ctx.emit
    })

    const toggle = () => {
      isOpen.value ? close() : open()
    }

    onClickOutside(popper, close)

    watch(isOpen, (open) => {
      if (!open) {
        ctx.emit('update:modelValue', date.value)
      }
    })

    return {
      isOpen,
      reference,
      popper,
      toggle,
      date
    }
  },

  data() {
    const isRange = isArray(this.date)
    const isTime = isArray(this.date)
      ? this.date.some((d) => d.includes(':'))
      : this.date.includes(':')
    return {
      isRange,
      isTime
    }
  },

  computed: {
    computedBaseFormats() {
      return isArray(this.modelValue)
        ? this.modelValue.some((d) => d.includes(':'))
          ? BASE_DATE_FORMAT_WITH_TIME
          : BASE_DATE_FORMAT
        : this.modelValue.includes(':')
        ? BASE_DATE_FORMAT_WITH_TIME
        : BASE_DATE_FORMAT
    },
    displayDate() {
      return isArray(this.modelValue)
        ? this.modelValue
            .map((d) =>
              dayjs(d, this.computedBaseFormats).format(this.conditionalDisplayFormats(d))
            )
            .join(' -- ')
        : dayjs(this.modelValue, this.computedBaseFormats).format(
            this.conditionalDisplayFormats(this.modelValue)
          )
    }
  },

  methods: {
    conditionalDisplayFormats(value) {
      return value.includes(':') ? DISPLAY_DATE_FORMAT_WITH_TIME : DISPLAY_DATE_FORMAT
    }
  }
}
</script>

<template>
  <div ref="reference" class="flex" @click="toggle">
    <button class="text-[11px]">{{ displayDate }}</button>
  </div>
  <teleport v-if="isOpen" to="body">
    <div ref="popper" class="bg-white">
      <v-calendar v-model:value="date" :is-range="isRange" :is-time="isTime"></v-calendar>

      <!-- settings -->
      <div class="mt-[8px]">
        <div class="w-full flex items-center justify-between">
          <span>End date</span>
          <input v-model="isRange" type="checkbox" />
        </div>
        <div class="w-full flex items-center justify-between mt-[2px]">
          <span>Include time</span>
          <input v-model="isTime" type="checkbox" />
        </div>
      </div>
    </div>
  </teleport>
</template>
