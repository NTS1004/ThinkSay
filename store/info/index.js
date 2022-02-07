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
    async setInfo(state, info) {
      state.info = info
	  // const { id, background } = info
	  // let cache_image = uni.getStorageInfoSync(`cache-image-${id}`) || {}
	  // const { background: cache_background } = cache_image
	  // const { background: { url } } = info
	  // if (url !== cache_background) {
	  // 	await uni.getImageInfo({
	  // 		       src: url,
	  // 		       success: ({ height, path }) => {
	  // 		       	console.log(height)
	  // 		       	console.log(path)
	  // 		       }
	  // 		    })
	  // }
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
