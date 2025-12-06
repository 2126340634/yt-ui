<script setup lang="ts">
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    theme?: ThemeColor | 'none'
    modelValue?: string
    value?: string
    placeholder?: string
    disabled?: boolean
    focus?: boolean
    autoBlur?: boolean
    showButton?: boolean
  }

  withDefaults(defineProps<Props>(), {
    theme: 'none',
    modelValue: '',
    value: '',
    placeholder: '请输入搜索内容',
    disabled: false,
    focus: false,
    autoBlur: true,
    showButton: true
  })

  const emit = defineEmits<{
    'update:modelValue': [modelValue: string]
    input: [value: any]
    focus: [{ value: any; height: number }]
    blur: [value: any]
    confirm: [value: any]
    keyboardHeightChange: [{ height: number; duration: number }]
  }>()

  function handleUpdateModelValue(modelValue: any) {
    emit('update:modelValue', modelValue)
  }
  function handleInput(value: any) {
    emit('input', value)
  }
  function handleFocus(value: any) {
    emit('focus', value)
  }
  function handleBlur(value: any) {
    emit('blur', value)
  }
  function handleConfirm(value: any) {
    emit('confirm', value)
  }
  function handleKeyboardHeightChange(value: any) {
    emit('keyboardHeightChange', value)
  }

  defineOptions({
    name: 'YtSearch'
  })
</script>

<template>
  <view class="yt-search">
    <yt-icon
      name="Search"
      class="yt-search--icon"
      :size="50"
      :width="28"
      :height="28"
    />
    <yt-input
      :height="28"
      confirmType="search"
      :padding="showButton ? '0 55px 0 28px' : '0 4px 0 28px'"
      class="yt-search--input"
      :theme="theme"
      :value="value"
      :modelValue="modelValue"
      @update:modelValue="handleUpdateModelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :focus="focus"
      :autoBlur="autoBlur"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @confirm="handleConfirm"
      @keyboardHeightChange="handleKeyboardHeightChange"
    />
    <yt-button
      v-if="showButton"
      class="yt-search--button"
      :theme="theme"
      size="small"
    >
      搜索
    </yt-button>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/_themes.scss';
  @use '../../styles/components/_search.scss';
</style>
