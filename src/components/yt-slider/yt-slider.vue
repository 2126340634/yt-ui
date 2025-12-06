<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref } from 'vue'

  interface Props {
    name?: string
    modelValue?: number | null
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    value?: number
    showValue?: boolean
    blockSize?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    modelValue: null,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    value: 0,
    showValue: true,
    blockSize: 20 // 12-28
  })

  // 初始化传入的checked
  const currentValue = ref<any>(0)
  if (props.modelValue !== null) currentValue.value = props.modelValue
  else currentValue.value = props.value

  const emit = defineEmits<{
    'update:modelValue': [modelValue: number]
    change: [value: number]
    changing: [value: number]
  }>()

  function handleChange(e: any) {
    currentValue.value = e.detail.value
    emit('update:modelValue', e.detail.value)
    emit('change', e.detail.value)
  }
  function handleChanging(e: any) {
    currentValue.value = e.detail.value
    emit('update:modelValue', e.detail.value)
    emit('changing', e.detail.value)
  }

  defineOptions({
    name: 'YtSlider'
  })

  const registerField: any = inject('registerField', () => {})
  const unregisterField: any = inject('unregisterField', () => {})
  const getValue = () => {
    return currentValue.value
  }
  const setValue = (value: any) => {
    currentValue.value = value
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
  <slider
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :value="currentValue"
    :show-value="showValue"
    :block-size="blockSize"
    @change="handleChange"
    @changing="handleChanging"
  />
</template>
