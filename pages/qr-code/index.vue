<template>
  <view class="code" :style="backgroundStyle">
    <Header title="二维码名片" :header-style="headerStyle" @back="toBack"></Header>
    <view class="qrcode-card">
      <view class="qrcode-box">
        <canvas id="qrcode" canvas-id="qrcode" style="width: 100%; height: 100%" />
        <view class="image">
          <u-avatar class="avatar" mode="square" size="120" :src="info.avatar"></u-avatar>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Header from "@/componets/Header/index.vue"
import { mapState } from "vuex"
import uQRCode from "./_utils/uqrcode.js"
export default {
  components: {
    Header
  },
  data() {
    return {
      headerStyle: {
        textShadow: "0px 0px 3px #FFFFFF, 0px 0px 3px #FFFFFF"
      }
    }
  },
  computed: {
    ...mapState("Info", ["info"]),
    backgroundStyle() {
      const { background } = this.info
      if (!background) {
        return ""
      }
      const { url } = background
      let backgroundImage = `background-image: url(${url})`
      return `${backgroundImage}`
    }
  },
  onReady() {
    uQRCode.make({
      canvasId: "qrcode",
      componentInstance: this,
      size: 280,
      margin: 0,
      text: `${this.info.id}`,
      backgroundColor: "#ffffff",
      foregroundColor: "#434343",
      fileType: "png",
      errorCorrectLevel: uQRCode.errorCorrectLevel.H
    })
  },
  methods: {
    toBack() {
      this.$u.route({
        type: "navigateBack"
      })
    }
  }
}
</script>

<style scoped lang="scss" src="./index.scss"></style>
