<script>
import VDatepicker from './datepicker/v-datepicker.vue'

const priorityColors = ['gray', 'red', 'orange', 'blue']

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
    priorityClasses() {
      const color = priorityColors[this.todo.priority]
      return this.todo.priority === 0 ? `` : `border-${color}-500 bg-${color}-50`
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
      :class="priorityClasses"
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
