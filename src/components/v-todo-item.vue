<script>
// import dayjs from 'dayjs'
import VDatepicker from './datepicker/v-datepicker.vue'

export default {
  components: {
    VDatepicker
  },

  data() {
    // const floatingStarValue = dayjs(new Date()).subtract(2, 'day').toDate()
    return {
      date: new Date()
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
        <p>some test todo title</p>
      </div>
      <div class="flex">
        <button class="text-[11px]">15 mar</button>
        <v-datepicker v-model="date"></v-datepicker>
      </div>
    </div>
  </li>
</template>
