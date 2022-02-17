<template>
  <view class="rtc" :style="background" @tap.stop="tapScreen">
    <Header
      :class="['head', show ? '' : 'hide']"
      left-icon="icon-suoxiao"
      :header-style="headerStyle"
      :title-style="titleStyle"
      @back="windowing"
    >
      <view slot="title">
        <view class="title-box" style="position: relative">
          <view class="box">
            <view>{{ title }}</view>
            <view class="dot" v-if="rtc_status !== 'connected'">...</view>
          </view>
        </view>
      </view>
    </Header>
    <view class="friend" v-if="showFriendInfo">
      <u-avatar class="avatar" mode="square" size="165" :src="avatar"></u-avatar>
      <view class="name">{{ rtc_info.name }}</view>
    </view>
    <view :class="['ctrl', show ? '' : 'hide']">
      <view v-for="(item, index) in ctrlList" :key="index" :class="['ctrl-box', margin(index)]">
        <view
          v-if="item.type === 'speaker'"
          :class="['ctrl-item', speaker ? 'active' : '']"
          @tap="tapCtrl(item.func, item.mode)"
        >
          <view v-if="speaker" class="speaker" style="margin-left: -6px">
            <view class="iconfont icon-speaker"></view>
            <view class="iconfont icon-right"></view>
          </view>
          <view v-else class="iconfont icon-close-speaker"></view>
        </view>
        <view
          v-else-if="item.type.includes('switch') || item.extend === 'switch-voice'"
          :class="['ctrl-item', item.type, item.extend ? 'switch-voice-box' : '', item.extend]"
          hover-class="hover_switch"
          hover-start-time="100"
          hover-stay-time="150"
          @tap.stop=""
        >
          <view class="speak" v-if="item.type === 'switch-voice' || item.extend === 'switch-voice'">
            <view class="iconfont icon-to"></view>
            <view class="iconfont icon-speak"></view>
          </view>
          <view v-else class="iconfont icon-switch-camera"></view>
          <view class="ctrl-text" v-if="item.extendText">
            {{ item.extendText }}
          </view>
        </view>
        <view
          v-else-if="!['voice', 'video', 'hang'].includes(item.type)"
          :class="['ctrl-item', isActive(item.mode)]"
          @tap.stop="tapCtrl(item.func, item.mode)"
        >
          <view :class="['iconfont', `icon-${item.type}`, 'uIcon']"></view>
        </view>
        <u-button
          v-if="['voice', 'video', 'hang'].includes(item.type)"
          :type="item.type === 'hang' ? 'error' : 'primary'"
          :custom-style="ctrlBtn"
        >
          <view :class="['iconfont', `icon-${item.type}`, item.type]"></view>
        </u-button>
        <view
          class="ctrl-text"
          :style="{ textShadow: rtc_type === 'voice' ? '0px 0px 2px #434343, 0px 0px 20px #ffffff' : '' }"
        >
          {{ item.text }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState, mapMutations } from "vuex"
import Header from "@/componets/Header/index.vue"
import getCtrlType from "./utils/getCtrlType"
import createWindow from "./utils/createWindow"
export default {
  components: {
    Header
  },
  data() {
    return {
      headerStyle: {
        color: "#fff"
      },
      leftStyle: {
        textShadow: "0px 0px 2px #434343, 0px 0px 20px #ffffff;"
      },
      titleStyle: {
        textShadow: "0px 0px 2px #434343, 0px 0px 20px #434343"
      },
      ctrlBtn: {
        width: "100%",
        height: "100%",
        borderRadius: "50%"
      },
      show: true
    }
  },
  computed: {
    ...mapState("App", ["statusBarHeight"]),
    ...mapState("Rtc", ["rtc_type", "rtc_status", "grounp", "rtc_info", "microPhone", "speaker"]),
    ...mapState("Cache", ["cache_image"]),
    title() {
      const { rtc_type, rtc_status } = this
      let title
      if (rtc_status !== "connected") {
        title = rtc_status === "send" ? "等待对方接受邀请" : `邀请你${rtc_type === "voice" ? "语音通话" : "视频聊天"}`
      }
      return title
    },
    avatar() {
      const { cache_image } = this
      const { avatar } = this.rtc_info
      return cache_image[avatar] || avatar
    },
    background() {
      const { cache_image } = this
      const { background } = this.rtc_info || {}
      if (this.rtc_type === "voice" && !this.grounp && background) {
        const { url } = background
        let backgroundImage = `background-image: url(${cache_image[url] || url})`
        return `${backgroundImage}`
      } else {
        return "background: #434343"
      }
    },
    ctrlList() {
      const { rtc_type, rtc_status, microPhone, speaker } = this
      const {
        accept,
        hang,
        micro_phone,
        speaker: ctrl_speaker,
        switch_voice,
        switch_camera
      } = getCtrlType(rtc_type, rtc_status, microPhone, speaker)
      let ctrl_list = []
      if (rtc_type === "voice") {
        if (["send", "connected"].includes(rtc_status)) {
          ctrl_list = [micro_phone, hang, ctrl_speaker]
        } else {
          ctrl_list = [hang, accept]
        }
      } else {
        if (rtc_status === "send") {
          ctrl_list = [hang, switch_voice]
        } else if (rtc_status === "receive") {
          ctrl_list = [hang, Object.assign({}, accept, { extend: "switch-voice", extendText: "切换语音通话" })]
        } else {
          ctrl_list = [switch_voice, hang, switch_camera]
        }
      }
      return ctrl_list
    },
    isActive() {
      return (mode) => {
        if (mode) {
          return this[mode] ? "active" : ""
        } else {
          return ""
        }
      }
    },
    margin() {
      return (index) => {
        if (this.ctrlList.length === 2) {
          return index ? "ctrl-box-marginLeft" : "ctrl-box-marginRight"
        } else {
          return ""
        }
      }
    },
    showSwitchVoice() {
      return (index) => {
        const { rtc_type, rtc_status } = this
        return rtc_type === "video" && rtc_status === "receive" && index
      }
    },
    showFriendInfo() {
      const { rtc_type, rtc_status } = this
      return rtc_type === "voice" || rtc_status !== "connected"
    }
  },
  methods: {
    ...mapMutations(["setState"]),
    windowing() {
      this.$u.route({
        type: "navigateBack"
      })
      createWindow()
    },
    tapScreen() {
      const { rtc_type, rtc_status } = this
      if (rtc_type === "video" && rtc_status === "connected") {
        this.show = !this.show
      }
    },
    tapCtrl(func, mode) {
      if (mode) {
        this.setState({
          module: "Rtc",
          state: {
            [mode]: !this[mode]
          }
        })
      }
    },
    ctrlMicroPhone() {},
    ctrlSpeaker() {}
  }
}
</script>

<style scoped lang="scss" src="./index.scss"></style>
