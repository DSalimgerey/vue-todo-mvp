<script>
import VDatepicker from './datepicker/v-datepicker.vue'

export default {
  components: {
    VDatepicker
  },

  props: ['todo'],
  emits: ['updateDate'],

  data() {
    const date = this.todo.dueDate.value
    return {
      date
    }
  },

  computed: {
    priority() {
      let value
      switch (this.todo.priority) {
        case 1:
          value = 'border-red-500 bg-red-50 border-[2px]'
          break
        case 2:
          value = 'border-orange-500 bg-orange-50 border-[2px]'
          break
        case 3:
          value = 'border-blue-500 bg-blue-50 border-[2px]'
          break
        default:
          value = 'border-gray-400'
          break
      }

      return value
    }
  },

  watch: {
    date(value) {
      this.$emit('updateDate', { value, id: this.todo.id })
    }
  }
}
</script>

<template>
  <li class="flex py-[3px]">
    <button
      class="w-[18px] h-[18px] border border-gray-400 rounded-full mr-[10px] mt-[2px]"
      :class="priority"
    ></button>
    <div>
      <div>
        <p>{{ todo.title }}</p>
      </div>
      <div class="flex mt-[2px]">
        <v-datepicker v-model="date"></v-datepicker>
      </div>
    </div>
  </li>
</template>
