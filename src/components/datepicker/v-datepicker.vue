<script>
import { isArray } from '../../utils'
import { isDate, isValidRange } from './utils'

export default {
  name: 'v-datepicker',
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
    }
  }
}
</script>

<template>
  <div></div>
</template>
