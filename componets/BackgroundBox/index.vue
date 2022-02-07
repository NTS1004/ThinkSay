<template>
  <view :class="['background-box', radius ? 'radius' : '']">
    <view :class="['background', typeof this.top !== 'number' ? 'cover-height' : '']" :style="background"></view>
  </view>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: ""
    },
    top: {
      type: [Number, String],
      default: null
    },
    radius: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    background() {
	  let { url, top } = this
	  // let infoBoxHeightPx = uni.upx2px(579)
	  // let surplusHeight = 900 - top
	  // top = infoBoxHeightPx > surplusHeight ? top - (infoBoxHeightPx - surplusHeight) : top
      let background
      if (typeof top === "number") {
        background = `background-image: url(${url}); transform: translateY(-${top}px)`
      } else {
        background = `background-image: url(${url})`
      }
      return background
    }
  }
}
</script>

<style scoped lang="scss">
.background-box {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  .background {
    width: 100%;
    height: 100vh;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
	transition: .3s all;
  }
  .cover-height {
    height: 100%;
  }
}
.radius {
  border-radius: 0 0 28rpx 28rpx;
}
</style>
