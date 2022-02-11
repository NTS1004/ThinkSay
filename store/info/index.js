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
      if (Object.keys(data).length === 0) {
        state.friend_info = {}
        state.chat_friend_id = null
        this.commit("Record/clearFriendChatRecord")
      } else {
        state.friend_info = Object.assign({}, state.friend_info, data)
      }
    },
    initFriendChat(state, friendId) {
      let { friends_record_info } = this.state.Record
      state.chat_friend_id = friendId
      state.friend_info = friends_record_info[friendId]
      this.commit("Record/initFriendChatRecord", friendId)
    }
  }
}
