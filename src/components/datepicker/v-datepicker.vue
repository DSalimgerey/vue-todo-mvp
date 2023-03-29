<script>
import { computed, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { usePopper } from '../../composables/use-popper'
import { isArray } from '../../utils'
import { format } from './utils'
import VCalendar from './v-calendar.vue'
import { BASE_DATE_FORMAT } from '../../utils/constants'
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
        Array.isArray(value)
          ? value.every((v) => dayjs(v, BASE_DATE_FORMAT, true).isValid())
          : dayjs(value, BASE_DATE_FORMAT, true).isValid()
    }
  },

  emits: {
    ['update:modelValue']: null,
    open: null,
    close: null
  },

  setup(props, ctx) {
    const date = computed({
      get() {
        return props.modelValue
      },
      set(value) {
        ctx.emit('update:modelValue', value)
      }
    })
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
