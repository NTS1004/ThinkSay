<template>
  <view class="infoBox" :style="infoBox" @tap="setPreview">
    <view :class="['operation', preview ? 'hide' : '']" :style="{ top }" @tap.stop>
      <slot name="left-operation"></slot>
      <slot name="right-operation"></slot>
    </view>
    <view :class="['info', preview ? 'hide' : '']" @tap.stop>
	  <image class="avatar" :src="avatar" @tap.stop="tapAvatar"></image>
      <view class="name">{{ info.name }}</view>
    </view>
    <BackgroundBox :background-info="backgroundInfo" :radius="radius" :preview="preview"></BackgroundBox>
  </view>
</template>

<script>
import BackgroundBox from "@/componets/BackgroundBox/index.vue"
import { mapState } from "vuex"
export default {
  components: {
    BackgroundBox
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    radius: {
      type: Boolean,
      default: true
    },
    tapAvatar: {
      type: Function,
      default: () => {}
    },
    hideOutside: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      preview: false
    }
  },
  computed: {
    ...mapState("App", ["infoBoxHeight", "statusBarHeight"]),
    ...mapState("Cache", ["cache_image"]),
    infoBox() {
      const { infoBoxHeight, radius, preview } = this
      return { height: preview ? `100vh` : `${infoBoxHeight}rpx`, boxShadow: `${radius ? "0px 2px 2px #c8c8c8" : ""}` }
    },
    backgroundInfo() {
      const {
        info: { background },
        infoBoxHeight
      } = this
      let backgroundInfo = Object.assign({}, background, { infoBoxHeight })
      return backgroundInfo
    },
    avatar() {
      const { cache_image } = this
      const { avatar } = this.info
      return cache_image[avatar] || avatar
    },
    top() {
      return `${this.statusBarHeight + 10}px`
    }
  },
  methods: {
    setPreview() {
      this.preview = !this.preview
      this.hideOutside()
    }
  }
}
</script>

<style scoped src="./index.scss" lang="scss"></style>
