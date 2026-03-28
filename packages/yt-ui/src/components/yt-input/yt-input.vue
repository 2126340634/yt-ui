<script setup lang="ts">
  import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
  import { InputType, KeyboardConfirmType } from '../../types/prop-types'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    name?: string // form-name
    theme?: ThemeColor | 'none'
    width?: number | string
    height?: number | string
    padding?: number | string
    modelValue?: string
    value?: string
    type?: InputType
    password?: boolean
    placeholder?: string
    disabled?: boolean
    maxlength?: number
    focus?: boolean
    confirmType?: KeyboardConfirmType // only when type = text
    confirmHold?: boolean // keep keyboard holding when confirm
    adjustPosition?: boolean
    autoBlur?: boolean
    holdKeyboard?: boolean // not hide when click page
    randomNumber?: boolean // random number when type = number,digit,idcard
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    theme: 'none',
    width: '100%',
    height: 30,
    padding: '0 4px',
    modelValue: '',
    value: '',
    type: 'text',
    password: false,
    placeholder: '请输入内容',
    disabled: false,
    maxlength: -1,
    focus: false,
    confirmType: 'done',
    confirmHold: false,
    adjustPosition: true,
    autoBlur: true,
    holdKeyboard: false,
    randomNumber: false
  })

  const inputClass = computed(() => {
    return ['yt-input', `yt-input--theme-${props.theme}`]
  })

  const inputStyle = computed(() => {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding
    }
  })

  const emit = defineEmits<{
    'update:modelValue': [modelValue: string]
    input: [value: any]
    focus: [{ value: any; height: number }]
    blur: [value: any]
    confirm: [value: any]
    keyboardHeightChange: [{ height: number; duration: number }]
  }>()

  const currentValue = ref<any>()

  function handleInput(e: any) {
    currentValue.value = e.detail.value
    emit('input', e.detail.value)
    emit('update:modelValue', e.detail.value)
  }
  function handleFocus(e: any) {
    emit('focus', e.detail)
  }
  function handleBlur(e: any) {
    emit('blur', e.detail.value)
  }
  function handleConfirm(e: any) {
    emit('confirm', e.detail.value)
  }
  function handleKeyboardHeightChange(e: any) {
    emit('keyboardHeightChange', e.detail)
  }

  watch(
    () => [props.modelValue, props.value],
    ([newModel, newVal]) => {
      const val = newModel || newVal
      if (val !== currentValue.value) {
        currentValue.value = val
      }
    },
    { immediate: true }
  )

  defineOptions({
    name: 'YtInput'
  })

  const registerField: any = inject('registerField', () => {})
  const unregisterField: any = inject('unregisterField', () => {})
  const getValue = () => {
    return currentValue.value
  }
  const setValue = (value: any) => {
    currentValue.value = value
    emit('input', value)
    emit('update:modelValue', value)
  }
  onMounted(() => {
    if (registerField && props.name) {
      registerField(props.name, getValue, setValue)
    }
  })
  onUnmounted(() => {
    if (unregisterField && props.name) {
      unregisterField(props.name)
    }
  })

  defineExpose({
    clear
  })
  function clear() {
    handleInput({ detail: { value: '' } })
  }
</script>

<template>
  <input
    :class="inputClass"
    :style="inputStyle"
    :value="currentValue"
    :type="type"
    :password="password"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :focus="focus"
    :confirm-type="confirmType"
    :confirm-hold="confirmHold"
    :auto-blur="autoBlur"
    :hold-keyboard="holdKeyboard"
    :random-number="randomNumber"
    :adjust-position="adjustPosition"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @confirm="handleConfirm"
    @keyboardheightchange="handleKeyboardHeightChange"
  />
</template>

<style lang="scss" scoped>
  @use '../../styles/_themes.scss';
</style>
