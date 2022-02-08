export default {
  namespaced: true,
  state: {
    info: {},
    friend_info: {},
    info_type: "",
    friend_tips: false,
    chat_friend_id: null
  },
  mutations: {
    setInfo(state, info) {
      const {
        avatar,
        background: { url }
      } = info
      const { cache_image } = this.state.Cache
      state.info = info
      if (!cache_image[avatar] || !cache_image[url]) {
        this.commit("Cache/handlerCacheImage", { avatar, url })
      }
      uni.setStorageSync("user-info", info)
    },
    setFriendInfo(state, data = {}) {
      const { cache_image } = this.state.Cache
      if (Object.keys(data).length === 0) {
        state.friend_info = {}
        state.chat_friend_id = null
        this.commit("Record/clearFriendChatRecord")
      } else {
        const { friend_info } = state
        state.friend_info = Object.assign({}, friend_info, data)
        const {
          avatar,
          background: { url }
        } = data
        this.commit("Cache/handlerCacheImage", { avatar, url })
      }
    },
    setInfoType(state, type) {
      state.info_type = type
    },
    setFriendTips(state, bool) {
      state.friend_tips = bool
    },
    setChatFriendId(state, friendId) {
      state.chat_friend_id = friendId
    },
    initFriendChat(state, friendId) {
      let { friends_record_info } = this.state.Record
      this.commit("Info/setChatFriendId", friendId)
      this.commit("Info/setFriendInfo", friends_record_info[friendId])
      this.commit("Record/initFriendChatRecord", friendId)
    }
  }
}
