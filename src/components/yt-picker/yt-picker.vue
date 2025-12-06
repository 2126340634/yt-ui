<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref } from 'vue'

  interface Props {
    name?: string
    type?: 'single' | 'multi' | 'date' | 'region'
    items?: any[]
    itemKey?: string
    start?: string
    end?: string
    disabled?: boolean
    fields?: 'year' | 'month' | 'day'
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    type: 'single',
    items: () => [],
    itemKey: '',
    start: '',
    end: '',
    disabled: false,
    fields: 'day'
  })

  if (props.items.some(item => typeof item === 'object') && !props.itemKey) {
    console.warn('[yt-picker] 使用对象数组的选择器时，请设置itemKey以作为显示内容')
  }
  if (props.items.length && (props.type === 'date' || props.type === 'region')) {
    console.warn('[yt-picker] 请使用正确的选择器类型')
  }
  if (props.type === 'multi' && props.items.some(item => !Array.isArray(item))) {
    console.warn('[yt-picker] 使用多列选择器时，请传入二维数组items')
  }

  // 映射为uniapp selector的mode name
  const typeMap = {
    single: 'selector',
    multi: 'multiSelector',
    date: 'date',
    region: 'region'
  }

  // 初始化传入的值
  const currentValue = ref<any>(null)

  const emit = defineEmits<{
    change: [value: any]
    cancel: []
    columnChange: [{ column: number; value: any }]
  }>()

  // normal selector value changed
  function handleChange(e: any) {
    currentValue.value = e.detail.value
    emit('change', e.detail.value)
  }

  // cancel event
  function handleCancel() {
    emit('cancel')
  }

  // multiselector value changed => return { columnIndex, index }
  function handleColumnChange(e: any) {
    emit('columnChange', e.detail)
  }

  defineOptions({
    name: 'YtPicker'
  })

  const registerField: any = inject('registerField', () => {})
  const unregisterField: any = inject('unregisterField', () => {})
  const getValue = () => {
    return currentValue.value
  }
  const setValue = (value: any) => {
    currentValue.value = value
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
  <picker
    :mode="typeMap[type]"
    :start="start"
    :end="end"
    @change="handleChange"
    @cancel="handleCancel"
    @columnchange="handleColumnChange"
    :range="items"
    :range-key="itemKey"
    :disabled="disabled"
    :fields="fields"
  >
    <slot />
  </picker>
</template>
