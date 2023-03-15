<script>
import { ref } from 'vue'
import { createPopper } from '@popperjs/core'
import { onClickOutside } from '@vueuse/core'
import VDropdownItem from './v-dropdown-item.vue'
import VDropdownDivider from './v-dropdown-divider.vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const freez = (obj) => Object.freeze(obj)
const keys = (obj) => Object.keys(obj)
const stopEvent = (e) => e.preventDefault()

const TRIGGERS = {
  hover: 'hover',
  click: 'click'
}

const setPopperEventListeners = (popper, enabled) => {
  popper?.setOptions((options) => ({
    ...options,
    modifiers: [...options.modifiers, { name: 'eventListeners', enabled }]
  }))
}

const enablePopperEventListeners = (popper) => setPopperEventListeners(popper, true)
const disablePopperEventListeners = (popper) => setPopperEventListeners(popper, false)

export default {
  name: 'v-dropdown',
  components: {
    VDropdownItem,
    VDropdownDivider,
    ChevronRightIcon
  },
  props: {
    text: {
      type: String,
      required: false
    },
    options: {
      type: Array,
      required: true
    },
    placement: {
      type: String,
      required: false,
      default: 'bottom-start'
    },
    trigger: {
      type: String,
      required: false,
      default: 'click',
      validator: (value) => keys(TRIGGERS).includes(value)
    },
    isNested: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  emits: ['open', 'close'],
  setup(_, { emit }) {
    const isOpen = ref(false)
    const popper = ref(null)

    onClickOutside(popper, () => close())

    const open = () => {
      emit('open')
      isOpen.value = true
    }
    const close = () => {
      emit('close')
      isOpen.value = false
    }
    const toggle = () => {
      isOpen.value ? close() : open()
    }

    return {
      isOpen,
      popper,
      open,
      close,
      toggle
    }
  },
  data() {
    return {
      popperInstance: null,
      TRIGGERS,
      focusedItemIndex: -1
    }
  },
  watch: {
    isOpen: {
      handler(value) {
        if (value) {
          this.initPopper()
          enablePopperEventListeners(this.popperInstance)
        } else {
          disablePopperEventListeners(this.popperInstance)
        }
      },
      immediate: true
    }
  },
  mounted() {
    document.addEventListener('keydown', this.onKeydown)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    initPopper() {
      this.$nextTick(() => {
        this.popperInstance = createPopper(this.$refs.reference, this.popper, {
          placement: this.isNested ? 'right-start' : this.placement ?? 'bottom-start',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [this.isNested ? -4 : 0, this.isNested ? -4 : 4]
              }
            }
          ]
        })
      })
    },
    getListItems() {
      const items = this.$refs.list?.querySelectorAll('li[data-dropdown-option]')
      return Array.from(items ?? [])
    },
    onKeydown(e) {
      const { code } = e
      const items = this.getListItems()

      if (code === 'ArrowUp' && this.focusedItemIndex > 0) {
        stopEvent(e)
        this.focusedItemIndex--

        items[this.focusedItemIndex]?.focus()
      }
      if (code === 'ArrowDown' && this.focusedItemIndex < items.length - 1) {
        stopEvent(e)
        this.focusedItemIndex++

        items[this.focusedItemIndex]?.focus()
      }
      // todo: add logic for handling arrow-right, arrow-left and enter
      if (code === 'ArrowRight') {
        stopEvent(e)
      }
      if (code === 'ArrowLeft' && this.isNested) {
        stopEvent(e)
      }
      if (code === 'Enter') {
        stopEvent(e)
      }
      if (code === 'Escape') {
        stopEvent(e)
        this.close()
        this.focusedItemIndex = -1
      }
    }
  }
}
</script>

<template>
  <div class="flex">
    <div
      class="flex"
      ref="reference"
      v-on="isNested && trigger === TRIGGERS.hover ? { mouseover: open } : { click: toggle }"
    >
      <slot name="trigger"
        ><button>{{ text }}</button></slot
      >
    </div>
    <teleport v-if="isOpen" to="body">
      <div
        ref="popper"
        class="w-[fit-content] bg-white border shadow-lg shadow-dark-900/6 rounded-[4px]"
      >
        <ul ref="list" class="flex flex-col p-[4px]">
          <template v-for="option in options" :key="option">
            <template v-if="option.items && option.items.length > 0">
              <v-dropdown
                :options="option.items"
                :is-nested="option.items && option.items.length > 0"
                trigger="hover"
              >
                <template #trigger>
                  <v-dropdown-item>
                    <div class="w-full h-full flex items-center justify-between">
                      {{ option.text }}
                      <chevron-right-icon
                        class="w-[11px] h-[11px] text-dark-900"
                      ></chevron-right-icon>
                    </div>
                  </v-dropdown-item>
                </template>
              </v-dropdown>
            </template>
            <component
              v-else
              :is="option.key === 'divider' ? 'v-dropdown-divider' : 'v-dropdown-item'"
            >
              <span class="text-[13px]">{{ option.text }}</span>
            </component>
          </template>
        </ul>
      </div>
    </teleport>
  </div>
</template>
