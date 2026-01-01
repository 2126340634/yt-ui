<script setup lang="ts">
  import { onUnmounted, provide, ref } from 'vue'

  interface Props {
    rules?: Record<string, { rule: (value: any) => boolean; message: string }[]>
  }

  const props = withDefaults(defineProps<Props>(), {
    rules: () => ({})
  })

  const fields = ref<Map<string, { getValue(): () => any; setValue: (value: any) => void }>>(
    new Map()
  )

  provide('registerField', (name: string, getValue: () => any, setValue: (value: any) => void) => {
    fields.value?.set(name, { getValue, setValue })
  })
  provide('unregisterField', (name: string) => {
    fields.value.delete(name)
  })
  function getFormData() {
    const formData: Record<string, any> = {}
    fields.value.forEach((item, name) => {
      formData[name] = item.getValue()
    })
    return formData
  }

  function handleSubmit() {
    const formData = getFormData()
    return formData
  }

  // 传names按name清除，否则默认全部清除
  function handleReset(names: string[] = []) {
    const resetAll = !names.length
    fields.value.forEach((item, key) => {
      if (!resetAll && !names.includes(key)) return
      const currentValue = item.getValue()
      if (Array.isArray(currentValue)) {
        item.setValue([])
      } else if (typeof currentValue === 'number') {
        item.setValue(0)
      } else {
        item.setValue(null)
      }
    })
  }

  function validateAll(): boolean {
    for (const [name, item] of fields.value) {
      const value = item.getValue()
      const rules = props.rules?.[name] || []
      for (const ruleObj of rules) {
        if (!ruleObj.rule(value)) {
          uni.showToast({ title: ruleObj.message, icon: 'none' })
          return false
        }
      }
    }
    return true
  }

  function validate(callback?: (valid: boolean) => void) {
    return callback ? callback(validateAll()) : validateAll()
  }

  onUnmounted(() => {
    fields.value.clear()
  })

  defineExpose({
    submitForm: handleSubmit,
    resetForm: handleReset,
    validate
  })

  defineOptions({
    name: 'YtForm'
  })
</script>

<template>
  <slot />
</template>
