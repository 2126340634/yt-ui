<script setup lang="ts">
  import { inject, onMounted, onUnmounted, ref, watch } from 'vue'

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

  const currentValue = ref<any>(null)

  const emit = defineEmits<{
    change: [value: any]
  }>()

  function handleChange(e: any) {
    currentValue.value = e.detail.value
    emit('change', e.detail.value)
  }

  watch(
    () => props.list,
    newList => {
      const defaultItem = newList.find(item => item.checked)
      if (defaultItem) {
        currentValue.value = defaultItem.value
      }
    },
    {
      immediate: true,
      deep: true
    }
  )

  defineOptions({
    name: 'YtRadioGroup'
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
  <radio-group @change="handleChange">
    <label
      v-for="item in list"
      :key="item.value"
    >
      <radio
        :value="item.value"
        :checked="currentValue === item.value"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </radio>
    </label>
  </radio-group>
</template>

<style lang="scss" scoped></style>
