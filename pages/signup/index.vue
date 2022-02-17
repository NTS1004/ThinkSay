<template>
  <view>
    <view class="tab-box" :style="{ height: `${infoBoxHeight}rpx`, ...background }">
      <view class="status_bar"></view>
      <view class="iconBox"><view class="iconfont icon-zuojiantou uIcon" @tap="goLogIn"></view></view>
      <view class="title">signup</view>
    </view>
    <view class="form-box">
      <input
        class="form-input"
        v-model="formData.account"
        placeholder="账号"
        placeholder-class="form-input-placeholder"
      />
      <input
        class="form-input"
        type="password"
        v-model="formData.password"
        placeholder="密码"
        placeholder-class="form-input-placeholder"
      />
      <input class="form-input" v-model="formData.name" placeholder="昵称" placeholder-class="form-input-placeholder" />
      <u-button type="primary" class="form-btn" @tap="signup">注册</u-button>
    </view>
  </view>
</template>

<script>
import { funcGetAuthRegister } from "@/api/auth/index.js"
import { mapState, mapMutations } from "vuex"
export default {
  name: "signup",
  data() {
    return {
      formData: {},
      backgroundUrl: "https://www.cjh1004.vip/ThinkSay/14.jpg!upyun520/fw/1300"
    }
  },
  computed: {
    ...mapState("App", ["infoBoxHeight"]),
    ...mapState("Cache", ["cache_image"]),
    background() {
      const { cache_image, backgroundUrl } = this
      return { backgroundImage: `url(${cache_image[backgroundUrl] ?? backgroundUrl})` }
    }
  },
  onLoad() {
    const { cache_image, backgroundUrl } = this
    if (!cache_image[backgroundUrl]) {
      this.handlerCacheImage({ url: backgroundUrl })
    }
  },
  methods: {
    ...mapMutations("Cache", ["handlerCacheImage"]),
    async getAuthRegister() {
      uni.showLoading({
        title: "注册中..."
      })
      try {
        await funcGetAuthRegister(this.formData)
        this.goLogIn()
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    },
    goLogIn() {
      this.$u.route({
        type: "navigateBack"
      })
      setTimeout(() => {
        this.formData = {}
      }, 500)
    },
    signup() {
      this.getAuthRegister()
    }
  },
  onBackPress() {
    if (getApp().model) {
      getApp().model.allClose()
      return true
    }
    return false
  }
}
</script>

<style scoped src="./signup.css"></style>
