<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref, watch } from 'vue'

  interface Props {
    name?: string
    modelValue?: boolean | null
    checked?: boolean
    disabled?: boolean
    type?: 'switch' | 'checkbox'
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    modelValue: null,
    checked: false,
    disabled: false,
    type: 'switch'
  })

  const currentValue = ref<any>(false)

  const emit = defineEmits<{
    'update:modelValue': [modelValue: boolean]
    change: [value: boolean]
  }>()

  function handleChange(e: any) {
    currentValue.value = e.detail.value
    emit('update:modelValue', e.detail.value)
    emit('change', e.detail.value)
  }

  watch(
    () => [props.modelValue, props.checked],
    ([newModel, newChecked]) => {
      const targetValue = newModel !== null ? !!newModel : !!newChecked
      if (currentValue.value !== targetValue) {
        currentValue.value = targetValue
      }
    },
    { immediate: true }
  )

  defineOptions({
    name: 'YtSwitch'
  })

  const registerField: any = inject('registerField', () => {})
  const unregisterField: any = inject('unregisterField', () => {})
  const getValue = () => {
    return currentValue.value
  }
  const setValue = (value: any) => {
    currentValue.value = !!value
    emit('update:modelValue', !!value)
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
  <switch
    :checked="currentValue"
    @change="handleChange"
    :type="type"
    :disabled="disabled"
  />
</template>
