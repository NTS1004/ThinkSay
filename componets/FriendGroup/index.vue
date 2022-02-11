<template>
  <view>
    <view class="list-key">{{ groupKey }}</view>
    <view
      class="friend-item"
      hover-class="activeItem"
      v-for="item in list"
      :key="item.id"
      @tap="$emit('Tap', { ...item, ...friends_record_info[item.id] })"
    >
      <u-avatar mode="square" :size="avatarSize" :src="Avatar(item)"></u-avatar>
      <view class="item-info">
        <view class="info-left">
          <view class="name">
            <view v-show="!item.id">搜索账号/昵称：</view>
            <view :class="['item-info-text', !item.id ? 'search-color' : '']">{{ Name(item) }}</view>
          </view>
          <view class="msg" v-if="type === 'recrod'">{{ item.msg }}</view>
        </view>
        <view class="info-right" v-if="type === 'recrod'">
          <u-button
            type="primary"
            :custom-style="{ flex: 1, width: '100rpx', height: '60rpx', fontSize: '28rpx' }"
            v-if="item.status === 'verify'"
            @tap="putFriendAccept(item)"
          >
            接受
          </u-button>
          <view v-else style="color: #666">已添加</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { funcPutFriendAccept } from "@/api/friend/index.js"
import { mapState, mapActions } from "vuex"
export default {
  props: {
    groupKey: {
      type: String,
      default: ""
    },
    data: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: "search"
    },
    avatarSize: {
      type: Number,
      default: 96
    }
  },
  data() {
    return {
      list: []
    }
  },
  computed: {
    ...mapState("Record", ["friends_record_info"]),
    ...mapState("Cache", ["cache_image"]),
    Avatar() {
      return ({ id, avatar }) => {
        const { friends_record_info, cache_image } = this
        let record_avatar = friends_record_info[id]?.avatar
        return cache_image[record_avatar || avatar] || record_avatar || avatar || ""
      }
    },
    Name() {
      return ({ id, name }) => {
        if (this.friends_record_info[id]) {
          return this.friends_record_info[id].name
        } else {
          return name
        }
      }
    }
  },
  watch: {
    data: {
      handler(newVal) {
        this.list = [...newVal]
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async putFriendAccept(item = {}) {
      uni.showLoading({
        title: "处理中..."
      })
      try {
        await funcPutFriendAccept({
          friendId: item.id,
          msg: item.msg,
          info: Object.assign({}, item, { name: this.Name(item) })
        })
        item.status = "friend"
      } catch (err) {
        console.log(err)
      }
      uni.hideLoading()
    }
  }
}
</script>

<style scoped lang="scss" src="./index.scss"></style>
