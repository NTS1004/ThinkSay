export default {
  namespaced: true,
  state: {
    info: {},
    friend_info: {},
    info_type: "",
    friend_tips: false,
    chat_friend_id: "",
    isChat: false
  },
  mutations: {
    setInfo(state, info) {
      const {
        avatar,
        background: { url }
      } = info
      state.info = Object.assign({}, state.info, info)
      this.commit("Cache/handlerCacheImage", { avatar, url })
      uni.setStorageSync("user-info", info)
    },
    setFriendInfo(state, data = {}) {
      if (Object.keys(data).length === 0) {
        state.friend_info = {}
        state.chat_friend_id = ""
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
