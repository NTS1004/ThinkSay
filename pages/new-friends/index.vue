<template>
  <view class="newFriends">
    <Header title="新的朋友" @back="goHome"></Header>
    <u-input
      v-model="searchValue"
      :custom-style="customStyle"
      :border="true"
      :clearable="false"
      placeholder="请输入账号/昵称"
      @input="inputSearch"
    >
    </u-input>
    <FriendGroup
      v-for="(value, key) in searchValue ? filter_new_friends_record : new_friends_record"
      :key="key"
      :groupKey="key"
      :data="value"
      type="recrod"
      @Tap="toNewFriend"
    >
    </FriendGroup>
  </view>
</template>

<script>
import Header from "@/componets/Header/index.vue"
import FriendGroup from "@/componets/FriendGroup/index.vue"
import { mapState, mapMutations } from "vuex"
export default {
  components: {
    Header,
    FriendGroup
  },
  data() {
    return {
      customStyle: {
        padding: "0 6rpx",
        textAlign: "center"
      },
      searchValue: "",
      filter_new_friends_record: {}
    }
  },
  computed: {
    ...mapState("Record", ["new_friends_record"])
  },
  methods: {
    ...mapMutations(["setState"]),
    ...mapMutations("Info", ["setFriendInfo"]),
    inputSearch(e) {
      let new_friends_record = Object.keys(this.new_friends_record)
      let filter_new_friends_record = {}
      if (e) {
        let key = e.toLocaleUpperCase()
        let keyIndex = new_friends_record.indexOf(key)
        if (keyIndex !== -1) {
          filter_new_friends_record[key] = this.new_friends_record[key]
        } else {
          for (let i in this.new_friends_record) {
            let keyValue = this.new_friends_record[i]
            let data = keyValue.filter(({ name, account, pinyin }) => {
              return [name, account, pinyin].includes(e)
            })
            if (data.length > 0) {
              filter_new_friends_record[i] = data
            }
          }
        }
      }
      this.filter_new_friends_record = filter_new_friends_record
    },
    toNewFriend(info) {
      this.setFriendInfo(info)
      this.setState({
        module: "Info",
        state: {
          info_type: info.status === "verify" ? "make_friend" : "friend"
        }
      })
      this.$u.route({
        url: info.status === "verify" ? "/pages/info/index" : "/pages/chat/index",
        params: info.status === "verify" ? {} : { friendId: info.id }
      })
    },
    goHome() {
      this.$u.route({
        type: "navigateBack"
      })
    }
  }
}
</script>

<style scoped lang="scss" src="./index.scss"></style>
