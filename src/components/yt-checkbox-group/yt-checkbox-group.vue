<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref } from 'vue'

  interface Props {
    name?: string // form-name
    list: {
      label?: string | number
      value?: string | number
      checked?: boolean
      disabled?: boolean
    }[]
  }

  const props = withDefaults(defineProps<Props>(), {
    name: '',
    list: () => []
  })

  // 初始化传入的checked
  const currentValue = ref<any[]>([])
  const defaultItem = props.list.filter(item => item.checked).map(item => item.value)
  if (defaultItem.length) currentValue.value = defaultItem

  const emit = defineEmits<{
    change: [value: any[]]
  }>()

  function handleChange(e: any) {
    currentValue.value = e.detail.value
    emit('change', e.detail.value)
  }

  defineOptions({
    name: 'YtCheckboxGroup'
  })

  const registerField: any = inject('registerField', () => {})
  const unregisterField: any = inject('unregisterField', () => {})
  const getValue = () => {
    return [...currentValue.value]
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
  <checkbox-group @change="handleChange">
    <label
      v-for="item in list"
      :key="item.value"
    >
      <checkbox
        :value="item.value"
        :checked="currentValue.includes(item.value)"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </checkbox>
    </label>
  </checkbox-group>
</template>
