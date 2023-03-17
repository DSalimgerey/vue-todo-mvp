<script>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { usePopper } from '../../composables/use-popper'
import { isArray } from '../../utils'
import { isDate, isValidRange } from './utils'
import VCalendar from './v-calendar.vue'

export default {
  name: 'v-datepicker',
  components: {
    VCalendar
  },

  props: {
    modelValue: {
      type: [Date, Array],
      required: true,
      validator: (value) => (isArray(value) ? isValidRange(value) : isDate(value))
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

  setup(_, ctx) {
    const reference = ref(null)
    const popper = ref(null)
    const { isOpen, open, close } = usePopper(reference, popper, {
      emit: ctx.emit
    })

    const toggle = () => {
      isOpen.value ? close() : open()
    }

    onClickOutside(popper, close)

    return {
      isOpen,
      reference,
      popper,
      toggle
    }
  },

  methods: {
    onDateSelect(date) {
      this.$emit('update:modelValue', date)
    }
  }
}
</script>

<template>
  <div ref="reference" @click="toggle">
    <button>datepicker</button>
  </div>
  <teleport v-if="isOpen" to="body">
    <div ref="popper" class="bg-white">
      <v-calendar :value="modelValue" @select="onDateSelect($event)"></v-calendar>
    </div>
  </teleport>
</template>
