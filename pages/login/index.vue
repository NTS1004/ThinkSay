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
      formData: {},
      top: 0,
      start_y: 0,
      start_x: 0,
      screenWidth: 0,
      screenHeight: 0,
      x: 0,
      ti: null,
      move: false
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
    uni.getSystemInfo({
      success: (res) => {
        const { screenWidth, screenHeight } = res
        this.screenWidth = screenWidth
        this.screenHeight = screenHeight
      }
    })
    const { cache_image, backgroundUrl } = this
    console.log(cache_image)
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
    },
    createView() {
      var view = new plus.nativeObj.View("window", { top: "50px", left: "0px", height: "100px", width: "100px" })
      view.drawRect(
        { color: "#434343", borderWidth: "2px", radius: "8px" },
        { top: "0px", left: "0px", width: "100%", height: "100%" }
      )
      view.show()
      view.addEventListener(
        "click",
        (e) => {
          if (this.move) return
        },
        false
      )
      view.addEventListener(
        "touchstart",
        (e) => {
          const { clientX, clientY } = e
          this.start_x = clientX
          this.start_y = clientY
        },
        false
      )
      view.addEventListener(
        "touchmove",
        (e) => {
          this.move = true
          const { pageX, pageY } = e
          let moveX = pageX - this.start_x
          let moveY = pageY - this.start_y
          let x = moveX
          let y = moveY
          let maxX = this.screenWidth - 100
          let maxY = this.screenHeight - 100
          if (x < 0) {
            x = 0
          } else if (x > maxX) {
            x = maxX
          }
          if (y < 0) {
            y = 0
          } else if (y >= maxY) {
            y = maxY
          }
          view.setStyle({
            top: `${y}px`,
            left: `${x}px`
          })
          this.x = x
        },
        false
      )
      view.addEventListener(
        "touchend",
        (e) => {
          let target
          let x = this.x
          if (this.x > this.screenWidth / 2 - 100 / 2) {
            target = this.screenWidth - 100
            this.ti = setInterval(() => {
              x += 30
              if (x >= target) {
                x = target
                clearInterval(this.ti)
              }
              view.setStyle({
                left: `${x}px`
              })
            }, 15)
          } else {
            target = 0
            this.ti = setInterval(() => {
              x -= 30
              if (x <= 0) {
                x = 0
                clearInterval(this.ti)
              }
              view.setStyle({
                left: `${x}px`
              })
            }, 15)
          }
          this.x = target
          this.$nextTick(() => {
            this.move = false
          })
        },
        false
      )
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
