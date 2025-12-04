<script setup lang="ts">
  interface Props {
    list: {
      label?: string | number
      value?: string | number
      checked?: boolean
      disabled?: boolean
    }[]
  }

  withDefaults(defineProps<Props>(), {
    list: () => []
  })

  const emit = defineEmits<{
    change: [value: any]
  }>()

  function handleChange(e: any) {
    emit('change', e.detail.value)
  }

  defineOptions({
    name: 'YtRadioGroup'
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
        :checked="item.checked"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </radio>
    </label>
  </radio-group>
</template>

<style lang="scss" scoped></style>
