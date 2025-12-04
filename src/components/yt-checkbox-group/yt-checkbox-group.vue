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
    change: [value: any[]]
  }>()

  function handleChange(e: any) {
    emit('change', e.detail.value)
  }

  defineOptions({
    name: 'YtCheckboxGroup'
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
        :checked="item.checked"
        :disabled="item.disabled"
      >
        {{ item.label }}
      </checkbox>
    </label>
  </checkbox-group>
</template>

<style lang="scss" scoped></style>
