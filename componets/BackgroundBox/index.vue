<template>
  <view :class="['background-box', radius ? 'radius' : '']">
    <view :class="['background', cover, radius ? 'radius' : '']" :style="background"></view>
  </view>
</template>

<script>
import { mapState, mapMutations } from "vuex"
export default {
  props: {
    backgroundInfo: {
      type: Object,
      default: () => {}
    },
    radius: {
      type: Boolean,
      default: true
    },
    preview: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      top: 0
    }
  },
  computed: {
    ...mapState("App", ["isCover"]),
    ...mapState("Cache", ["cache_image"]),
    background() {
      const { cache_image, isCover, preview, top } = this
      let { url } = this.backgroundInfo
      let translateY = typeof top === "number" && !isCover ? `transform: translateY(-${preview ? 0 : top}px)` : ""
      let background = `background-image: url(${cache_image[url] || url}); ${translateY}`
      return background
    },
    cover() {
      const { isCover } = this
      const { top } = this.backgroundInfo
      let cover = isCover || typeof top !== "number" ? "cover-height" : ""
      return cover
    }
  },
  watch: {
    backgroundInfo: {
      handler({ top }) {
        this.top = top
      },
      immediate: true
    }
  },
  mounted() {
    const { infoBoxHeight } = this.backgroundInfo
    const infoBoxHeightPx = uni.upx2px(infoBoxHeight)
    const query = uni.createSelectorQuery()
    query
      .select(".background")
      .boundingClientRect(({ height, top }) => {
        let surplusHeight = height + top
        if (infoBoxHeightPx > surplusHeight) {
          this.setState({
            module: "App",
            state: {
              isCover: true
            }
          })
        }
      })
      .exec()
  },
  methods: {
    ...mapMutations(["setState"])
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
    width: 100vw;
    height: 100vh;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    transition: 0.4s all;
  }
  .cover-height {
    height: 100%;
  }
}
.radius {
  border-radius: 0 0 28rpx 28rpx;
}
</style>
