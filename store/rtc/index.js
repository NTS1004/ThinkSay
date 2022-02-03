const default_state = {
	// 连接类型
    rtc_type: "",
	// 连接状态
    rtc_status: "",
	// 是否群聊
	grounp: false,
	// 连接的用户信息
    rtc_info: undefined
  }

export default {
  namespaced: true,
  state: {
	// 连接类型
    rtc_type: "",
	// 连接状态
    rtc_status: "",
	// 是否群聊
	grounp: false,
	// 连接的用户信息
    rtc_info: undefined
  },
  mutations: {
	  setState(state, data) {
		  state = Object.assign(state, data)
		  console.log(state)
	  },
	  closeRtc(state) {
		  state = default_state
	  }
  }
}
