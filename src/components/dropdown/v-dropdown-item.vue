<script>
export default {
  name: 'v-dropdown-item',
  computed: {
    isFocused() {
      return document.activeElement === this.$refs.item
    }
  }
}
</script>

<template>
  <li
    ref="item"
    data-dropdown-option
    class="min-w-[130px] w-full px-[6px] py-[1px] rounded hover:cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
    :tabindex="isFocused ? 0 : -1"
  >
    <slot></slot>
  </li>
</template>
