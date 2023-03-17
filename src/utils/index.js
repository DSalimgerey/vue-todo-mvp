import { unref } from 'vue'

export const isArray = (value) => Array.isArray(value)

export const focus = (el) => unref(el)?.focus()

export const isActiveElement = (el) => document.activeElement === unref(el)
