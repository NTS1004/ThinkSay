import store from "@/store/index.js"

export default {
  namespaced: true,
  state: {
    component_status: false,
    close: false,
    rtc_type: "",
    rtc_status: "",
    rtc_info: {}
  }
}
