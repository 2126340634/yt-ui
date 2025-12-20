<script setup lang="ts">
  import { ref } from 'vue'
  import { ThemeColor } from '../../types/theme-types'
  import YtInput from '../yt-input/yt-input.vue'

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
    search: [value: any]
  }>()

  const currentValue = ref<any>('')

  function handleUpdateModelValue(modelValue: any) {
    emit('update:modelValue', modelValue)
  }
  function handleInput(value: any) {
    currentValue.value = value
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
  function handleSearch() {
    emit('search', currentValue.value)
  }

  const ytInputRef = ref<InstanceType<typeof YtInput> | null>(null)
  function handleClear() {
    ytInputRef.value?.clear()
  }

  defineOptions({
    name: 'YtSearch'
  })
</script>

<template>
  <view class="yt-search">
    <!-- search-icon -->
    <yt-icon
      name="Search"
      class="yt-search--icon"
      :size="13"
      :width="28"
      :height="28"
    />
    <yt-input
      ref="ytInputRef"
      confirmType="search"
      :padding="showButton ? '0 75px 0 28px' : '0 30px 0 28px'"
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
    <!-- clear-button -->
    <span
      v-show="currentValue"
      class="yt-search--clear"
      :style="{ right: showButton ? '52px' : '4px' }"
      @click="handleClear"
    >
      X
    </span>
    <!-- search-button -->
    <yt-button
      v-if="showButton"
      class="yt-search--button"
      :theme="theme"
      size="small"
      @click="handleSearch"
    >
      搜索
    </yt-button>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/_themes.scss';
  @use '../../styles/components/_search.scss';
</style>
