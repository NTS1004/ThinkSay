<template>
  <view class="search">
    <view class="status_bar"></view>
    <view class="header">
      <view class="iconfont icon-zuojiantou uIcon" @tap="toHome"></view>
      <u-input
        :custom-style="customStyle"
        :border="true"
        :clearable="false"
        placeholder="请输入账号/昵称"
        @input="inputSearch"
      >
      </u-input>
    </view>
    <scroll-view class="scroll" scroll-y="true">
      <FriendGroup v-show="this.newFriend.length > 0" groupKey="新朋友" :data="this.newFriend" @Tap="toNewFriendInfo">
      </FriendGroup>
      <FriendGroup v-show="this.friend.length > 0" groupKey="好友" :data="this.friend" @Tap="toFriendChat">
      </FriendGroup>
      <FriendGroup v-show="this.group.length > 0" groupKey="群聊" :data="this.group"></FriendGroup>
    </scroll-view>
  </view>
</template>

<script>
import FriendGroup from "@/componets/FriendGroup/index.vue"
import { funcGetSearchFriends } from "@/api/friend/index.js"
import { mapState, mapMutations } from "vuex"
export default {
  components: {
    FriendGroup
  },
  data() {
    return {
      friend: [],
      newFriend: [],
      group: [],
      customStyle: {
        padding: "0 6rpx"
      },
      params: {},
      searchTimeout: null
    }
  },
  computed: {
    ...mapState("App", ["friend_data"])
  },
  methods: {
    ...mapMutations(["setState"]),
    ...mapMutations("Info", ["setFriendInfo"]),
    async getSearchFriends() {
      uni.showLoading({
        title: "搜索中..."
      })
      try {
        const {
          data: [info]
        } = await funcGetSearchFriends(this.params)
        info.background = JSON.parse(info.background)
        this.toNewFriendInfo(info)
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    },
    inputSearch(e) {
      this.params.key = e
      let friend_data = Object.keys(this.friend_data)
      let friend = []
      if (this.params.key) {
        let key = e.toLocaleUpperCase()
        let keyIndex = friend_data.indexOf(key)
        if (keyIndex !== -1) {
          friend = this.friend_data[key]
        } else {
          for (let i in this.friend_data) {
            let keyValue = this.friend_data[i]
            let data = keyValue.filter((item) => {
              const { name, account, pinyin } = item
              return item.name.indexOf(e) !== -1 || item.account.indexOf(e) !== -1 || item.pinyin.indexOf(e) !== -1
            })
            friend = [...friend, ...data]
          }
        }
      } else {
        friend = []
      }
      if (e.length > 0 && friend.length === 0) {
        this.newFriend = [
          {
            name: e
          }
        ]
      } else {
        this.newFriend = []
      }
      this.friend = friend
    },
    toHome() {
      this.$u.route({
        type: "navigateBack"
      })
    },
    toFriendChat(info) {
      this.setFriendInfo(info)
      this.$u.route({
        url: "/pages/chat/index",
        params: { friendId: info.id }
      })
    },
    toNewFriendInfo(info) {
      if (info.id) {
        this.setFriendInfo(info)
        this.setState({
          module: "Info",
          state: {
            info_type: "meet_friend"
          }
        })
        this.$u.route({
          url: "/pages/info/index"
        })
      } else {
        this.getSearchFriends()
      }
    }
  }
}
</script>

<style scoped lang="scss" src="./index.scss"></style>
