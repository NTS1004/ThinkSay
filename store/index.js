import Vue from "vue"
import Vuex from "vuex"
import App from "./app/index.js"
import Info from "./info/index.js"
import Record from "./record/index.js"
import Rtc from "./rtc/index.js"
import Cache from "./cache/index.js"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  modules: {
    App,
    Info,
    Record,
    Rtc,
	Cache
  }
})
