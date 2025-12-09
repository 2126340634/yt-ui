<script setup lang="ts">
  import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
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
    confirmType?: KeyboardConfirmType
    confirmHold?: boolean
    adjustPosition?: boolean
    autoBlur?: boolean
    holdKeyboard?: boolean
    randomNumber?: boolean
    autoFocus?: boolean
    autoHeight?: boolean
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
    randomNumber: false,
    autoFocus: false,
    autoHeight: false
  })

  const textareaClass = computed(() => {
    return ['yt-textarea', `yt-textarea--theme-${props.theme}`]
  })

  const textareaStyle = computed(() => {
    return {
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      padding: typeof props.padding === 'number' ? `${props.padding}px` : props.padding
    }
  })

  const emit = defineEmits<{
    'update:modelValue': [modelValue: string]
    input: [{ value: any; cursor: number }]
    focus: [{ value: any; height: number }]
    blur: [{ value: any; cursor: number }]
    confirm: [value: any]
    keyboardHeightChange: [{ height: number; duration: number }]
    lineChange: [{ height: number; heightRpx: number; lineCount: number }]
  }>()

  function handleInput(e: any) {
    currentValue.value = e.detail.value
    emit('input', e.detail.value)
    emit('update:modelValue', e.detail.value)
  }
  function handleFocus(e: any) {
    emit('focus', e.detail)
  }
  function handleBlur(e: any) {
    emit('blur', e.detail)
  }
  function handleConfirm(e: any) {
    emit('confirm', e.detail.value)
  }
  function handleKeyboardHeightChange(e: any) {
    emit('keyboardHeightChange', e.detail)
  }
  function handleLineChange(e: any) {
    emit('lineChange', e.detail)
  }

  defineOptions({
    name: 'YtInput'
  })

  const currentValue = ref<any>(props.modelValue || props.value)
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
</script>

<template>
  <textarea
    :class="textareaClass"
    :style="textareaStyle"
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
    :auto-focus="autoFocus"
    :auto-height="autoHeight"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @confirm="handleConfirm"
    @keyboardheightchange="handleKeyboardHeightChange"
    @linechange="handleLineChange"
  />
</template>

<style lang="scss" scoped>
  @use '../../styles/_themes.scss';

  .yt-textarea {
    ::-webkit-scrollbar {
      display: none;
    }
  }
</style>
