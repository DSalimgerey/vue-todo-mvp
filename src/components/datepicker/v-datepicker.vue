<script>
import { ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { usePopper } from '../../composables/use-popper'
import { isArray } from '../../utils'
import { format, isDate, isValidRange } from './utils'
import VCalendar from './v-calendar.vue'
import { BASE_DATE_FORMAT } from '../../utils/constants'

export default {
  name: 'v-datepicker',
  components: {
    VCalendar
  },

  props: {
    modelValue: {
      type: [Date, Array],
      required: true
    }
  },

  emits: {
    ['update:modelValue'](payload) {
      if (isValidRange(payload) || isDate(payload)) {
        return true
      } else {
        return false
      }
    },
    open: null,
    close: null
  },

  setup(props, ctx) {
    const date = ref(props.modelValue)
    const reference = ref(null)
    const popper = ref(null)
    const { isOpen, open, close } = usePopper(reference, popper, {
      emit: ctx.emit
    })

    const toggle = () => {
      isOpen.value ? close() : open()
    }

    onClickOutside(popper, close)

    watch(date, (value) => ctx.emit('update:modelValue', value))

    return {
      isOpen,
      reference,
      popper,
      toggle,
      date
    }
  },

  data() {
    return {
      isRange: false
    }
  },

  computed: {
    displayDate() {
      return isArray(this.modelValue)
        ? this.modelValue.map((d) => format(d, BASE_DATE_FORMAT)).join(' -- ')
        : format(this.modelValue, BASE_DATE_FORMAT)
    }
  }
}
</script>

<template>
  <div ref="reference" @click="toggle">
    <button class="text-[12px]">{{ displayDate }}</button>
  </div>
  <teleport v-if="isOpen" to="body">
    <div ref="popper" class="bg-white">
      <v-calendar v-model:value="date" :is-range="isRange"></v-calendar>

      <!-- settings -->
      <div class="mt-[8px]">
        <div class="w-full flex items-center justify-between">
          <span>End date</span>
          <input v-model="isRange" type="checkbox" />
        </div>
      </div>
    </div>
  </teleport>
</template>
