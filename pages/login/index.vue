<template>
  <view>
    <view class="tab-box" :style="{ height: `${infoBoxHeight}rpx`, ...background }">
      <view class="status_bar"></view>
      <view class="iconBox">
        <view class="iconfont icon-jiahao uIcon" style="font-size: 38rpx" @tap="goSignUp"></view>
      </view>
      <view class="title">login</view>
    </view>
    <view class="form-box">
      <input
        class="form-input"
        v-model="formData.account"
        placeholder="账号/昵称"
        placeholder-class="form-input-placeholder"
      />
      <input
        type="password"
        class="form-input"
        v-model="formData.password"
        placeholder="密码"
        placeholder-class="form-input-placeholder"
      />
      <u-button type="primary" class="form-btn" @tap="getAuthLogin">登录</u-button>
    </view>
  </view>
</template>

<script>
import { funcGetAuthLogin } from "@/api/auth/index.js"
import { mapState, mapMutations } from "vuex"
export default {
  name: "login",
  data() {
    return {
      backgroundUrl: "https://www.cjh1004.vip/ThinkSay/13.jpg!upyun520/fw/1300",
      formData: {}
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
    ...mapMutations(["setState"]),
    ...mapMutations("Info", ["setInfo"]),
    ...mapMutations("Cache", ["handlerCacheImage"]),
    async getAuthLogin() {
      uni.showLoading({
        title: "登录中..."
      })
      try {
        const {
          data,
          data: { id },
          token
        } = await funcGetAuthLogin(this.formData)
        getApp().init(id, Object.assign(data, { token }))
        this.$u.route({
          type: "redirect",
          url: "/pages/index/index"
        })
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    },
    goSignUp() {
      this.$u.route({
        url: "pages/signup/index"
      })
    }
  },
  onBackPress() {
    if (getApp().model) {
      getApp().model.allClose()
      return true
    }
    return false
  },
  onShow() {
    this.setState({
      module: "App",
      state: {
        lastPage: true
      }
    })
  },
  onHide() {
    this.setState({
      module: "App",
      state: {
        lastPage: false
      }
    })
  },
  onUnload() {
    this.setState({
      module: "App",
      state: {
        lastPage: false
      }
    })
  }
}
</script>

<style scoped src="./index.css"></style>
