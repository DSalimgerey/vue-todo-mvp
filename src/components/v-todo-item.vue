<script>
import VDatepicker from './datepicker/v-datepicker.vue'

export default {
  components: {
    VDatepicker
  },

  props: ['todo'],
  emits: ['updateDate'],

  data() {
    const date = this.todo.dueDate
    return {
      date
    }
  },

  watch: {
    date(value) {
      console.log(value)
      this.$emit('updateDate', { value, id: this.todo.id })
    }
  }
}
</script>

<template>
  <li class="flex py-[3px]">
    <button
      class="w-[18px] h-[18px] border border-gray-400 rounded-full mr-[10px] mt-[2px]"
    ></button>
    <div>
      <div>
        <p>{{ todo.title }}</p>
      </div>
      <div class="flex">
        <v-datepicker v-model="date"></v-datepicker>
      </div>
    </div>
  </li>
</template>
