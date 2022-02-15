import { funcGetFriendList } from "@/api/friend/index.js"

export default {
  namespaced: true,
  state: {
    ws_connect: false,
    network_status: true,
    friend_data: {},
    statusBarHeight: 0,
    lastPage: true,
    isBackground: false,
    infoBoxHeight: 540,
    isCover: false
  },
  mutations: {
    setFriendData(state, data) {
      state.friend_data = data
    },
    deleteFriend(state, { initials, index }) {
      let friend_data = state.friend_data
      friend_data[initials].splice(index, 1)
      if (friend_data[initials].length === 0) delete friend_data[initials]
      state.friend_data = friend_data
    },
    updateFriendData(state, { current_initials, next_initials, info }) {
      const { id: myId } = this.state.Info.info
      let user_record = uni.getStorageSync(`user-record-${myId}`) || {}
      let friend_data = state.friend_data
      let friend_initials_list = friend_data[current_initials]
      for (let i = 0; i < friend_initials_list.length; i++) {
        const { id } = friend_initials_list[i]
        if (Number(id) === Number(info.id)) {
          friend_initials_list.splice(i, 1)
          break
        }
      }
      if (friend_initials_list.length === 0) delete friend_data[current_initials]
      if (!friend_data[next_initials]) friend_data[next_initials] = []
      friend_data[next_initials].push(info)
      state.friend_data = Object.assign({}, friend_data)
      user_record.friend_data = friend_data
      uni.setStorageSync(`user-record-${myId}`, user_record)
    },
    getRecordFriendList(state, data = {}) {
      if (Object.keys(data).length == 0) {
        const { id: myId } = this.state.Info.info
        data = uni.getStorageSync(`user-record-${myId}`)
      }
      const { friend_data = {} } = data
      state.friend_data = friend_data
    }
  },
  actions: {
    async getFriendList({ commit }) {
      try {
        const { data } = await funcGetFriendList()
        const { id: myId } = this.state.Info.info
        const { chat_friend_id } = this.state.Info
        let user_record = uni.getStorageSync(`user-record-${myId}`) || {}
        let friend_data = {}
        for (let i = 0; i < data.length; i++) {
          const { id: friendId, initials, avatar, background } = data[i]
          data[i].background = JSON.parse(background)
          if (!friend_data[initials]) {
            friend_data[initials] = []
          }
          data[i].index = friend_data[initials].length
          friend_data[initials].push(data[i])
          if (!user_record[friendId]) user_record[friendId] = {}
          user_record[friendId].info = {
            ...user_record[friendId].info,
            ...data[i]
          }
          if (Number(chat_friend_id) === Number(friendId)) {
            this.commit("Info/setFriendInfo", data[i])
          }
          this.commit("Cache/handlerCacheImage", { avatar, url: background.url })
          user_record[friendId].status = "friend"
        }
        user_record.friend_data = friend_data
        this.commit("Record/handlerFriendsRecordInfo", user_record)
        commit("setFriendData", friend_data)
        uni.setStorageSync(`user-record-${myId}`, user_record)
      } catch (err) {
        console.log(err)
      }
    }
  }
}
