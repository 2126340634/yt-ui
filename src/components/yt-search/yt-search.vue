<script setup lang="ts">
import { ref } from 'vue'
import YtInput from '../yt-input/yt-input.vue'

interface Props {
  modelValue?: string
  value?: string
  placeholder?: string
  disabled?: boolean
  focus?: boolean
  autoBlur?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  value: '',
  placeholder: '请输入搜索内容',
  disabled: false,
  focus: false,
  autoBlur: true
})

const emit = defineEmits<{
  'update:modelValue': [modelValue: string]
  input: [value: any]
  focus: [{ value: any; height: number }]
  blur: [value: any]
  confirm: [value: any]
  keyboardHeightChange: [{ height: number; duration: number }]
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
    <yt-input
      ref="ytInputRef"
      confirm-type="search"
      class="yt-search--input"
      padding="0 30px 0 4px"
      :value="value"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :auto-blur="autoBlur"
      :focus="focus"
      @update:model-value="handleUpdateModelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @confirm="handleConfirm"
      @keyboard-height-change="handleKeyboardHeightChange"
    >
      <!-- search-icon -->
      <template #prefix>
        <yt-icon name="Search" class="yt-search--icon" :size="20" :width="20" :height="20" />
      </template>
    </yt-input>
    <!-- clear-button -->
    <view
      v-show="currentValue"
      class="yt-search--clear"
      :style="{ right: '4px', pointerEvents: currentValue ? 'auto' : 'none' }"
      @click="handleClear"
    >
      X
    </view>
  </view>
</template>

<style lang="scss" scoped>
@use '../../styles/components/_search.scss';
</style>
