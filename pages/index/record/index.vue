<template>
  <scroll-view class="scroll" scroll-y="true" style="height: 100%">
    <view class="record">
      <view
        v-for="item in chat_record_list"
        :key="item.id"
        class="item"
        hover-class="activeItem"
        @tap="toFriendChat(item)"
      >
        <view style="position: relative">
          <u-avatar mode="square" size="94" :src="Avatar(item)" style="position: relative"> </u-avatar>
          <u-badge v-show="item.badge_count" :count="item.badge_count" type="error" :offset="[-10, -10]"></u-badge>
        </view>
        <view class="itemBody">
          <view class="itemHead">
            <b class="friendName">{{ friends_record_info[item.id].name }}</b>
            <span class="openTime">{{ hander_charTime(item.chatTime) }}</span>
          </view>
          <view class="itemBottom">
            <view class="context">{{ message(item) }}</view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import { mapState } from "vuex"
import hander_charTime from "@/utils/hander_chatTime.js"
export default {
  computed: {
    ...mapState("Record", ["chat_record_list", "friends_record_info"]),
    ...mapState("Cache", ["cache_image"]),
    Avatar() {
      return ({ id }) => {
        const { friends_record_info, cache_image } = this
        let record_avatar = friends_record_info[id].avatar
        return cache_image[record_avatar] || record_avatar
      }
    },
    message() {
      return (item) => {
        let message
        const { msg, tip, name } = item
        message = msg || tip
        return message
      }
    }
  },
  methods: {
    hander_charTime,
    toFriendChat(info) {
      this.$emit("toFriendChat", { ...info, ...this.friends_record_info[info.id] })
    }
  }
}
</script>

<style scoped lang="scss" src="./record.scss"></style>
