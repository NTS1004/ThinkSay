const default_state = {
  // 连接类型
  rtc_type: "",
  // 连接状态
  rtc_status: "",
  // 是否群聊
  grounp: false,
  // 连接的用户信息
  rtc_info: undefined,
  // 麦克风是否打开
  microPhone: true,
  // 扬声器是否打开
  speaker: false
}

export default {
  namespaced: true,
  state: default_state,
  mutations: {
    closeRtc(state) {
      state = default_state
    }
  }
}
