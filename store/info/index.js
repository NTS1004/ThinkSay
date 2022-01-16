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
      state.info = info
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
      state.friend_info = friends_record_info[friendId]
      this.commit("Record/initFriendChatRecord", friendId)
    }
  }
}
