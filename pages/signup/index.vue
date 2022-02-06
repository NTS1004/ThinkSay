<template>
  <view>
    <view class="tab-box" :style="{ height: `${infoBoxHeight}rpx` }">
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
import { mapState } from "vuex"
export default {
  name: "signup",
  data() {
    return {
      formData: {}
    }
  },
  computed: {
    ...mapState("App", ["infoBoxHeight"])
  },
  methods: {
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
