<script setup lang="ts">
// 定义数据类型
interface MockItem {
  id: number
  title: string
  desc: string
  image: string
}

const mockList: MockItem[] = []

for (let i = 1; i <= 10000; i++) {
  if (i == 2) {
    mockList.push({
      id: 2,
      title: `虚拟列表测试条目 #${2}`,
      desc: `这是这是这是这是这是这是这是这是这是这是这是虚拟列表渲染的第 ${2} 条数据`,
      image: `https://picsum.photos/seed/item${i}/300/200`
    })
    continue
  }
  mockList.push({
    id: i,
    title: `虚拟列表测试条目 #${i}`,
    desc: `这是虚拟列表渲染的第 ${i} 条数据`,
    image: `https://picsum.photos/seed/item${i}/300/200`
  })
}
</script>

<template>
  <yt-virtual-list :list="mockList" item-key="id" height="100vh" :estimated-size="160" layout="waterfall">
    <template #list-item="{ item }">
      <view class="card">
        <image class="card-img" :src="item.image" mode="aspectFill" />
        <view class="card-text">
          <view class="title">{{ item.title }}</view>
          <view class="desc">{{ item.desc }}</view>
        </view>
      </view>
    </template>
  </yt-virtual-list>
</template>

<style lang="scss" scoped>
.card {
  display: flex;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  align-items: center;

  .card-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }
  .card-text {
    flex: 1;
    .title {
      font-size: 32rpx;
      font-weight: 500;
      margin-bottom: 10rpx;
    }
    .desc {
      font-size: 26rpx;
      color: #666;
    }
  }
}
</style>
