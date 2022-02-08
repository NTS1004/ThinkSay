<template>
  <view :class="['background-box', 'background', radius ? 'radius' : '']" :style="background"></view>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
	backgroundInfo: {
		type: Object,
		default: () => {}
	},
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
	...mapState('Cache', ['cache_image']),
    background() {
	  const { cache_image } = this
	  let { url, top } = this.backgroundInfo
	  let backgroundPosition = top ? `0 -${top}px` : 'center'
	  let background = `background-image: url(${cache_image[url] || url}); background-position: ${backgroundPosition};`
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
  background-size: cover;
  background-repeat: no-repeat;
  transition: .3s all;
}
.radius {
  border-radius: 0 0 28rpx 28rpx;
}
</style>
