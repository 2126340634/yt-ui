<script setup lang="ts">
  import { computed, CSSProperties, onUnmounted, watch } from 'vue'
  interface HeaderProps {
    title?: string
    cancelName?: string
    confirmName?: string
    cancelFn?: () => void
    confirmFn?: () => void
    closeSide?: 'left' | 'right'
  }
  interface Props {
    width?: number | string
    height?: number | string
    maxWidth?: number | string
    maxHeight?: number | string
    bgColor?: string
    overlayColor?: string
    visible?: boolean
    zIndex?: number
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    borderRadius?: number | string
    duration?: number
    closeOnOverlayClick?: boolean
    destroyOnClose?: boolean
    headerType?: 'close-only' | 'cancel-confirm' | 'none'
    headerProps?: HeaderProps
  }
  const props = withDefaults(defineProps<Props>(), {
    width: '70vw',
    height: '70vh',
    maxWidth: 'none',
    maxHeight: 'none',
    bgColor: '#ffffff',
    overlayColor: '#00000080',
    visible: false,
    zIndex: 1000,
    placement: 'bottom',
    borderRadius: 10,
    duration: 200,
    closeOnOverlayClick: true,
    destroyOnClose: false,
    headerType: 'none',
    headerProps: () => ({
      title: '',
      cancelName: '取消',
      confirmName: '确定',
      cancelFn: () => {},
      confirmFn: () => {},
      closeSide: 'right'
    })
  })
  const emit = defineEmits<{
    overlayClick: [e: Event]
    'update:visible': [value: boolean]
    open: []
    opened: []
    close: []
    closed: []
  }>()

  const shouldRender = computed(() => {
    return props.visible || !props.destroyOnClose
  })
  const popupBorderRadius = computed(() => {
    const borderRadius =
      typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
    let tl = '0'
    let tr = '0'
    let bl = '0'
    let br = '0'
    if (props.placement === 'top') {
      bl = borderRadius
      br = borderRadius
    }
    if (props.placement === 'bottom') {
      tl = borderRadius
      tr = borderRadius
    }
    if (props.placement === 'center') {
      tl = borderRadius
      tr = borderRadius
      bl = borderRadius
      br = borderRadius
    }
    return {
      '--popup-borderTopLeftRadius': tl,
      '--popup-borderTopRightRadius': tr,
      '--popup-borderBottomLeftRadius': bl,
      '--popup-borderBottomRightRadius': br
    }
  })
  const popupClass = computed(() => {
    return [
      'yt-popup',
      `yt-popup--${props.placement}`,
      {
        'yt-popup--visible': props.visible
      }
    ]
  })
  const popupStyle = computed(() => {
    const width = typeof props.width === 'number' ? `${props.width}px` : props.width
    const height = typeof props.height === 'number' ? `${props.height}px` : props.height
    const maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
    const maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
    return {
      ...popupBorderRadius.value,
      width: isCenter.value ? width : isHorizontal.value ? width : '100vw',
      height: isCenter.value ? height : isHorizontal.value ? '100vh' : height,
      '--popup-max-width': maxWidth,
      '--popup-max-height': maxHeight,
      '--popup-z-index': props.zIndex,
      '--popup-transition': `transform ${props.duration}ms ease-out, opacity ${props.duration}ms ease-out`,
      '--popup-background-color': props.bgColor,
      '--popup-header-close-justify-content':
        props.headerProps.closeSide === 'left' ? 'flex-start' : 'flex-end'
    } as CSSProperties
  })
  const isHorizontal = computed(() => {
    return props.placement === 'left' || props.placement === 'right'
  })
  const isCenter = computed(() => {
    return props.placement === 'center'
  })

  function handleOverlayClick(e: Event) {
    emit('overlayClick', e)
    if (props.closeOnOverlayClick) {
      emit('update:visible', false)
    }
  }

  let stateTime: NodeJS.Timeout | null = null
  watch(
    () => props.visible,
    newVal => {
      if (stateTime) {
        clearTimeout(stateTime)
        stateTime = null
      }
      if (newVal) {
        emit('open')
        stateTime = setTimeout(() => emit('opened'), props.duration)
      } else {
        emit('close')
        stateTime = setTimeout(() => emit('closed'), props.duration)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (stateTime) {
      clearTimeout(stateTime)
      stateTime = null
    }
  })

  defineOptions({
    name: 'YtPopup'
  })
</script>

<template>
  <view
    v-if="shouldRender"
    :class="popupClass"
    :style="popupStyle"
  >
    <view
      class="yt-popup--header"
      v-if="headerType !== 'none'"
    >
      <view
        v-if="headerType === 'cancel-confirm'"
        class="yt-popup--header-cancel-confirm"
      >
        <span
          class="yt-popup--text yt-popup--text-cancel"
          @click="props.headerProps.cancelFn"
        >
          {{ props.headerProps.cancelName }}
        </span>
        <span class="yt-popup--text yt-popup--text-title">{{ props.headerProps.title }}</span>
        <span
          class="yt-popup--text yt-popup--text-confirm"
          @click="props.headerProps.confirmFn"
        >
          {{ props.headerProps.confirmName }}
        </span>
      </view>

      <view
        v-if="headerType === 'close-only'"
        class="yt-popup--header-close-only"
      >
        <span class="yt-popup--text yt-popup--text-title">{{ props.headerProps.title }}</span>
        <yt-icon
          name="Close"
          :width="12"
          :height="12"
          :size="38"
          @click="() => emit('update:visible', false)"
        ></yt-icon>
      </view>
    </view>

    <slot />
  </view>

  <yt-overlay
    :visible="visible"
    :zIndex="zIndex - 1"
    :bgColor="overlayColor"
    @click="handleOverlayClick"
  />
</template>

<style lang="scss" scoped>
  @use '../../styles/components/_popup.scss';
  @use '../../styles/_themes.scss';
</style>
