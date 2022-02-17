<template>
  <view class="content">
    <view class="box">
      <InfoBox :info="info" :tapAvatar="() => (tabShow = true)" :hideOutside="hideOutside">
        <view slot="left-operation">
          <view class="iconfont icon-saoyisao uIcon" style="font-size: 50rpx" v-show="current === 0" @tap="saoyisao">
          </view>
          <view
            class="iconfont icon-tianjiahaoyou uIcon"
            style="font-size: 50rpx"
            v-show="current === 1"
            @tap="toNewFriend"
          >
            <u-badge v-show="friend_tips" :is-dot="true" type="error" :offset="[0, 4]"></u-badge>
          </view>
        </view>
        <view slot="right-operation">
          <view class="iconfont icon-sousuo uIcon" @tap.stop="toSearch"></view>
        </view>
      </InfoBox>
      <view :class="['tabBar', animation, visible ? 'show' : 'hide']">
        <view class="iconfont icon-xinxi tabIcon" :class="{ active: current === 0 }" @tap="setTab(0)"></view>
        <view class="iconfont icon-haoyou tabIcon" :class="{ active: current === 1 }" @tap="setTab(1)">
          <u-badge v-show="friend_tips" :is-dot="true" type="error" :offset="[0, 2]"></u-badge>
        </view>
        <!-- <view class="iconfont icon-qunliao tabIcon" @tap=""></view> -->
        <view class="iconfont icon-tupian tabIcon" @tap="toSetBackground"></view>
        <view class="iconfont icon-tuichu tabIcon" @tap="show = true"></view>
      </view>
    </view>
    <swiper :class="['swiper', visible ? '' : 'swiper-hide']" :current="current" @change="setCurrent">
      <swiper-item class="record-box">
        <u-alert-tips
          :show="!network_status"
          type="error"
          icon="error-circle"
          :show-icon="true"
          title="你的网络有问题，是没连wifi还是没用流量。"
          :title-style="alertStyle"
          style="border-radius: 0"
        >
        </u-alert-tips>
        <Record @toFriendChat="toFriendChat"></Record>
      </swiper-item>
      <swiper-item class="friend-box"><Friend @toFriendChat="toFriendChat"></Friend></swiper-item>
    </swiper>
    <u-action-sheet :list="list" v-model="show" @click="ctrlOut"></u-action-sheet>
    <u-action-sheet :list="tabList" v-model="tabShow" @click="ctrlInfo"></u-action-sheet>
    <u-modal
      ref="uModal"
      v-model="modalShow"
      title="修改昵称"
      confirm-text="修改"
      confirmColor="#52acff"
      :show-cancel-button="true"
      :async-close="true"
      @confirm="putMyInfo"
      @cancel="cancel"
    >
      <view class="slot-content">
        <input
          class="input"
          v-model="params.name"
          type="text"
          placeholder="请输入昵称"
          placeholder-class="input-placeholder"
          :focus="modalShow"
        />
      </view>
    </u-modal>
  </view>
</template>

<script>
import Record from "./record/index.vue"
import Friend from "./friend/index.vue"
import InfoBox from "@/componets/InfoBox/index.vue"
import { mapState, mapMutations } from "vuex"
import { funcPutMyInfo } from "@/api/info/index.js"
import { funcGetSearchFriends } from "@/api/friend/index.js"
export default {
  name: "home",
  components: {
    Record,
    Friend,
    InfoBox
  },
  data() {
    return {
      current: 0,
      show: false,
      tabShow: false,
      modalShow: false,
      ctrlIndex: null,
      tabBarHide: "",
      visible: true,
      params: {
        name: ""
      },
      alertStyle: {
        color: "red"
      },
      list: [
        {
          text: "退出登录"
        },
        {
          text: "开始不想说"
        }
      ],
      tabList: [
        {
          text: "修改昵称"
        },
        {
          text: "更换头像"
        },
        {
          text: "二维码名片"
        }
      ]
    }
  },
  computed: {
    ...mapState("App", ["network_status"]),
    ...mapState("Info", ["info", "friend_tips"]),
    animation() {
      const { tabBarHide } = this
      let animation = tabBarHide === "" ? "" : tabBarHide ? "hideAnimate" : "showAnimate"
      return animation
    }
  },
  onShow() {
    this.setState({
      module: "App",
      state: {
        lastPage: true
      }
    })
  },
  methods: {
    ...mapMutations(["setState"]),
    ...mapMutations("Info", ["setInfo", "setFriendInfo"]),
    ...mapMutations("Record", ["clearRecord"]),
    async putMyInfo() {
      let type = this.ctrlIndex === 0 ? "name" : "avatar"
      if (this.ctrlIndex !== 0) {
        uni.showLoading({
          title: "更换中..."
        })
      }
      try {
        const { data } = await funcPutMyInfo({ type, ...this.params })
        this.setInfo(Object.assign(this.info, data))
        if (this.ctrlIndex === 0) {
          this.cancel()
        }
      } catch (err) {
        if (this.ctrlIndex === 0) this.$refs.uModal.clearLoading()
      }
      if (this.ctrlIndex !== 0) {
        uni.hideLoading()
      }
    },
    async getSearchFriends(id) {
      uni.showLoading({
        title: "扫描识别中..."
      })
      try {
        const {
          data: [info]
        } = await funcGetSearchFriends({ id })
        info.background = JSON.parse(info.background)
        this.toNewFriendInfo(info, { source: "scan" })
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    },
    saoyisao() {
      uni.scanCode({
        success: (res) => {
          this.getSearchFriends(res.result)
        }
      })
    },
    setCurrent(e) {
      const { current } = e.detail
      this.current = current
    },
    setTab(index) {
      this.current = index
    },
    toSetBackground() {
      if (!this.network_status) {
        this.$Toast("当前网络不可用╥﹏╥...")
        return
      }
      this.$u.route({
        url: "/pages/background/index"
      })
    },
    toSearch() {
      this.$u.route({
        url: "/pages/search/index"
      })
    },
    toFriendChat({ id }) {
      this.$u.route({
        url: "/pages/chat/index",
        params: { friendId: id }
      })
    },
    toNewFriend() {
      this.$u.route({
        url: "/pages/new-friends/index"
      })
      if (this.friend_tips) {
        this.setState({
          module: "Info",
          state: {
            friend_tips: false
          }
        })
      }
    },
    toNewFriendInfo(info, params = {}) {
      this.setFriendInfo(info)
      this.setState({
        module: "Info",
        state: {
          info_type: "meet_friend"
        }
      })
      this.$u.route({
        url: "/pages/info/index",
        params
      })
    },
    ctrlOut(index) {
      if (index === 0) {
        this.loginOut()
      } else if (index === 1) {
        this.appOut()
      }
    },
    loginOut() {
      uni.removeStorageSync("user-info")
      this.clearRecord()
      if (getApp().ws) {
        getApp().ws.close()
      }
      this.$u.route({
        type: "redirectTo",
        url: "/pages/login/index"
      })
      this.$Toast("退出成功")
    },
    appOut() {
      plus.runtime.quitApp()
    },
    ctrlInfo(index) {
      this.ctrlIndex = index
      if (index === 0) {
        this.modalShow = true
      } else if (index === 1) {
        this.putMyInfo()
      } else {
        setTimeout(() => {
          this.$u.route({
            url: "/pages/qr-code/index"
          })
        }, 300)
      }
    },
    cancel() {
      this.modalShow = false
      setTimeout(() => {
        this.params = {}
      }, 300)
    },
    hideOutside() {
      this.tabBarHide = !this.tabBarHide
      setTimeout(() => {
        this.visible = !this.tabBarHide
      }, 300)
    }
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

<style scoped src="./home.scss" lang="scss"></style>
