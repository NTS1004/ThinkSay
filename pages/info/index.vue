<template>
  <view class="content">
    <InfoBox :info="friend_info" :radius="false">
      <view slot="left-operation">
        <view class="iconfont icon-zuojiantou uIcon" @tap.stop="goBack"></view>
      </view>
    </InfoBox>
    <view class="box">
      <view v-if="info_type === 'friend'">
        <view class="option-box">
          <view class="option">
            <span>信息免打扰</span>
            <u-switch v-model="quiet" size="40" @change="(v) => settingQuiet('quiet', v)" activeColor="#52acff">
            </u-switch>
          </view>
          <u-line type="info" />
          <view class="option">
            <span>加入黑名单</span>
            <u-switch :value="annoyed" size="40" @change="(v) => settingAnnoyed('annoyed', v)" activeColor="#52acff">
            </u-switch>
          </view>
          <u-line type="info" />
        </view>
        <view class="delete"><u-button type="error" :custom-style="errBtn" @tap="confirmDelete">删除</u-button></view>
      </view>
      <view v-else>
        <view class="option">
          <span>添加方式</span>
          <span>搜索查询</span>
        </view>
        <view class="btn-box" v-if="info_type === 'make_friend'">
          <u-button type="primary" class="btn" :custom-style="btnStyle('marginRight')" @tap="putFriendApply">
            添加好友
          </u-button>
          <u-button type="default" :custom-style="btnStyle('marginLeft')" @tap="goBack">取消</u-button>
        </view>
        <view class="btn-box" v-else>
          <u-button type="primary" :custom-style="btnStyle('marginRight')" @tap="putFriendAccept"> 接受 </u-button>
          <u-button type="error" :custom-style="btnStyle('marginLeft')" @tap="goBack">加入黑名单</u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import InfoBox from "@/componets/InfoBox/index.vue"
import { mapState, mapMutations, mapActions } from "vuex"
import {
  funcDeleteFriend,
  funcPutFriendApply,
  funcPutFriendAccept,
  funcPutFriendSetShield
} from "@/api/friend/index.js"
import BackgroundBox from "@/componets/BackgroundBox/index.vue"
export default {
  components: {
    InfoBox,
    BackgroundBox
  },
  data() {
    return {
      quiet: false,
      annoyed: false,
      quietWait: null,
      quietList: [],
      defaultQuiet: false,
      errBtn: { margin: "70rpx 0rpx", height: "105rpx", borderRadius: 0 }
    }
  },
  computed: {
    ...mapState("Info", ["info", "friend_info", "info_type"]),
    btnStyle() {
      return (direction) => {
        let btnStyle = { flex: 1, height: "100rpx" }
        btnStyle = Object.assign(btnStyle, { [direction]: "16rpx" })
        return btnStyle
      }
    }
  },
  onLoad() {
    let { quiet, annoyed } = this.info
    const { id: friendId } = this.friend_info
    this.quietList = quiet.map(Number)
    annoyed = annoyed.split(",").map(Number)
    if (this.quietList.indexOf(friendId) !== -1) {
      this.quiet = true
      this.defaultQuiet = true
    }
    if (annoyed.indexOf(friendId) !== -1) {
      this.annoyed = true
    }
  },
  methods: {
    ...mapMutations("App", ["deleteFriend"]),
    ...mapMutations("Info", ["setMakeFriend", "setInfo"]),
    ...mapMutations("Record", ["handlerNewFriendsRecord", "setNewFriendsRecordStatus", "handlerChatRecordList"]),
    ...mapActions("App", ["getFriendList"]),
    async delFriend() {
      uni.showLoading({
        title: "删除中..."
      })
      try {
        const { id: friendId, initials, index } = this.friend_info
        await funcDeleteFriend({ friendId })
        let user_record = uni.getStorageSync(`user-record-${this.info.id}`) || {}
        delete user_record[friendId]
        this.handlerNewFriendsRecord(user_record)
        this.handlerChatRecordList(user_record)
        this.deleteFriend({ initials, index })
        uni.setStorageSync(`user-record-${this.info.id}`, user_record)
        this.$u.route({
          type: "redirectTo",
          url: "/pages/index/index"
        })
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    },
    async putFriendApply() {
      uni.showLoading({
        title: "发送中..."
      })
      try {
        await funcPutFriendApply({ friendId: this.friend_info.id, info: this.friend_info })
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    },
    async putFriendAccept() {
      uni.showLoading({
        title: "处理中..."
      })
      try {
        const { id, initials, index } = this.friend_info
        await funcPutFriendAccept({ friendId: this.friend_info.id })
        this.setNewFriendsRecordStatus({ initials, index })
        this.goBack()
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    },
    async putFriendSetShield(shield, status) {
      if (shield === "annoyed") {
        uni.showLoading({
          title: `${status ? "加入" : "移除"}黑名单中...`
        })
      }
      try {
        const { data } = await funcPutFriendSetShield(shield, { friendId: this.friend_info.id, status: !status })
        if (shield === "annoyed") {
          this[shield] = !status
          this.setInfo(data)
        }
      } catch (err) {
        console.log(err)
      }
      if (shield === "annoyed") {
        uni.hideLoading()
      }
    },
    makeFriend() {
      getApp().ws.emit({ type: "apply", friendId: this.friend_info.id })
    },
    settingQuiet(shield, status) {
      const { id: friendId } = this.friend_info
      if (status) {
        this.quietList.push(friendId)
      } else {
        let index = this.quietList.indexOf(friendId)
        this.quietList.splice(index, 1)
      }
      this.setInfo(Object.assign(this.info, { quiet: this.quietList }))
    },
    backSetQuiet() {
      if (this.quiet !== this.defaultQuiet) {
        this.putFriendSetShield("quiet", !this.quiet)
      }
    },
    settingAnnoyed(shield, status) {
      if (status) {
        this.putFriendSetShield(shield, status)
      } else {
        this.$Modal({
          title: "加入黑名单",
          content: `你将无法接收到对方的消息\n同时对方也无法发送消息给你`,
          isCancel: true,
          ok: () => this.putFriendSetShield(shield, status)
        })
      }
    },
    confirmDelete() {
      this.$Modal({
        title: "删除好友",
        content: `将${this.friend_info.name}从好友列表删除\n聊天记录也将清空`,
        confirmText: "删除",
        confirmColor: "red",
        isCancel: true,
        ok: () => this.delFriend()
      })
    },
    goBack() {
      this.$u.route({
        type: "navigateBack"
      })
    }
  },
  onUnload() {
    this.backSetQuiet()
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

<style scoped src="./info.css"></style>
