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
  }
}
</script>

<template>
  <div></div>
</template>
