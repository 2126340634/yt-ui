<script setup lang="ts">
  interface Props {
    type: 'single' | 'multi' | 'date' | 'region'
    items: any[]
    itemKey: string
    start: string
    end: string
    disabled: boolean
    fields: 'year' | 'month' | 'day'
  }

  const props = withDefaults(defineProps<Props>(), {
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

  // 映射为uniapp selector的mode name
  const typeMap = {
    single: 'selector',
    multi: 'multiSelector',
    date: 'date',
    region: 'region'
  }

  const emit = defineEmits<{
    change: [value: any]
    cancel: []
    columnChange: [{ column: number; value: any }]
  }>()

  // normal selector value changed
  function handleChange(e: any) {
    emit('change', e.detail.value)
  }

  // cancel event
  function handleCancel(e: any) {
    emit('cancel')
  }

  // multiselector value changed => return { changedIndex, value }
  function handleColumnChange(e: any) {
    emit('columnChange', e.detail)
  }

  defineOptions({
    name: 'YtPicker'
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

<style lang="scss" scoped></style>
