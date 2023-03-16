import { ref, onBeforeUnmount, watch, unref, nextTick } from 'vue'
import { createPopper } from '@popperjs/core'
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow'
import offsetModifier from '@popperjs/core/lib/modifiers/offset'

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

export const usePopper = (reference, popper, options) => {
  const isOpen = ref(false)
  const popperInstance = ref(null)

  const setPopperEventListeners = (enabled) => {
    popperInstance.value?.setOptions((options) => ({
      ...options,
      modifiers: [...options.modifiers, { name: 'eventListeners', enabled }]
    }))
  }

  const enablePopperEventListeners = () => setPopperEventListeners(true)
  const disablePopperEventListeners = () => setPopperEventListeners(false)

  const open = () => {
    isOpen.value = true
    enablePopperEventListeners()
    popperInstance.value?.update()
    options.emit?.('open')
  }
  const close = () => {
    isOpen.value = false
    disablePopperEventListeners()
    options.emit?.('close')
  }

  const getDefaultOptions = () => ({
    placement: 'bottom',
    distanceOffset: 0,
    skiddingOffset: 0,
    emit: () => {}
  })

  watch(isOpen, (value) => {
    if (value) {
      nextTick(() => {
        const withDefault = { ...getDefaultOptions(), ...options }
        popperInstance.value = createPopper(unref(reference), unref(popper), {
          placement: withDefault.placement,
          modifiers: [
            preventOverflow,
            offsetModifier,
            {
              name: 'offset',
              options: {
                offset: [withDefault.skiddingOffset, withDefault.distanceOffset]
              }
            }
          ]
        })
      })
    } else {
      disablePopperEventListeners()
    }
  })

  onBeforeUnmount(() => {
    popperInstance.value?.destroy()
  })

  return {
    isOpen,
    popperInstance,
    open,
    close
  }
}
