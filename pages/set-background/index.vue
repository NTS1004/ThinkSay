<template>
  <view class="box" :style="backgroundImage">
    <view class="header-box">
      <view class="status_bar"></view>
      <view :class="['header', noTop]">
        <view class="iconfont icon-zuojiantou uIcon" @tap="goBack"></view>
        <view class="title">选择展示区域</view>
        <u-icon class="uIcon" name="checkmark" @tap="putMyInfo"></u-icon>
      </view>
    </view>
    <view class="mask"></view>
    <view
      class="select-box"
      :style="{ height: `${infoBoxHeight}rpx`, top: `${params.top}px` }"
      @touchstart="touchStart"
      @touchmove.prevent="touchMove"
    >
      <div class="box image" :style="`${backgroundImage};${translate}`"></div>
    </view>
  </view>
</template>

<script>
import { funcPutMyInfo } from "@/api/info/index.js"
import { mapState } from "vuex"
export default {
  data() {
    return {
      params: {
        top: 0
      },
      boxHeight: 530,
      start_y: 0
    }
  },
  computed: {
    ...mapState("App", ["statusBarHeight", "infoBoxHeight"]),
    ...mapState("Info", ["info"]),
    noTop() {
      let headerHeight = this.statusBarHeight + uni.upx2px(60)
      return this.params.top >= headerHeight ? "noTop" : ""
    },
    backgroundImage() {
      return `background-image: url(${this.params.url})`
    },
    translate() {
      return `transform: translateY(-${this.params.top}px)`
    },
    background() {
      let background = {
        url: this.params.url,
        top: this.params.top
      }
      return JSON.stringify(background)
    }
  },
  onLoad(e) {
    if (Object.keys(e).length > 0) {
      const { url, top } = e
      this.params.url = url
      this.params.top = top
    }
  },
  methods: {
    async putMyInfo() {
      uni.showLoading({
        title: "设置中..."
      })
      try {
        const { data } = await funcPutMyInfo({ type: "background", background: this.background })
        this.$store.commit("Info/setInfo", { ...this.info, ...data })
        uni.setStorageSync("user-info", { ...this.info, ...data })
        this.goBack()
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    },
    touchStart(e) {
      const {
        touches,
        target: { offsetTop }
      } = e
      const { clientY } = touches[0]
      this.start_y = clientY - offsetTop
    },
    touchMove(e) {
      let { clientY } = e.touches[0]
      let top = clientY - this.start_y > 0 ? clientY - this.start_y : 0
      if (top >= plus.screen.resolutionHeight - uni.upx2px(this.infoBoxHeight)) {
        top = plus.screen.resolutionHeight - uni.upx2px(this.infoBoxHeight)
      }
      this.params.top = top
    },
    goBack() {
      this.$u.route({
        type: "navigateBack"
      })
    }
  }
}
</script>

<style scoped lang="scss" src="./setBackground.scss"></style>
