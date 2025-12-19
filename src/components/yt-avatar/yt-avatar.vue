<script setup lang="ts">
  import { computed } from 'vue'
  import { ImageMode } from '../../types/prop-types'
  import { ThemeColor } from '../../types/theme-types'

  interface Props {
    theme?: ThemeColor | 'none'
    url?: string
    circle?: boolean
    size?: number
    fit?: ImageMode
    // badge
    enableBadgeTheme: boolean
    showBadge?: boolean
    count?: number
    overflowCount?: number
    dot?: boolean
    offset?: number[]
  }

  const props = withDefaults(defineProps<Props>(), {
    theme: 'none',
    url: '',
    circle: true,
    size: 60,
    fit: 'aspectFill',
    // badge
    enableBadgeTheme: true,
    showBadge: false,
    count: 0,
    overflowCount: 99,
    dot: false,
    offset: () => []
  })

  const emit = defineEmits<{
    click: [e: Event]
    load: [{ height: string; width: string }]
    error: [errMsg: string]
  }>()
  const avatarClass = computed(() => {
    return ['yt-avatar', `yt-avatar--theme-${props.theme}`]
  })
  const avatarStyle = computed(() => {
    return {
      borderRadius: props.circle ? '50%' : '0',
      width: `${props.size}px`,
      height: `${props.size}px`
    }
  })
  function handleLoad(e: any) {
    emit('load', e.detail)
  }
  function handleError(e: any) {
    emit('error', e.detail.errMsg)
  }
  function handleClick(e: Event) {
    emit('click', e)
  }

  defineOptions({
    name: 'YtAvatar'
  })
</script>

<template>
  <view class="yt-avatar--container">
    <view
      :class="avatarClass"
      :style="avatarStyle"
      @click="handleClick"
    >
      <image
        v-if="props.url"
        class="yt-avatar--image"
        :src="url"
        :mode="fit"
        @load="handleLoad"
        @error="handleError"
      />
      <yt-icon
        v-else
        name="DefaultAvatar"
        :width="props.size"
        :height="props.size"
      />
    </view>

    <!-- badge -->
    <view
      v-if="showBadge"
      class="yt-avatar--badge"
    >
      <yt-badge
        :theme="enableBadgeTheme ? theme : 'none'"
        :count="count"
        :overflowCount="overflowCount"
        :dot="dot"
        :offset="offset"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  @use '../../styles/components/avatar';
  @use '../../styles/themes';
</style>
