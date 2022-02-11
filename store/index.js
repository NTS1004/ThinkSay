import Vue from "vue"
import Vuex from "vuex"
import App from "./app/index.js"
import Info from "./info/index.js"
import Record from "./record/index.js"
import Rtc from "./rtc/index.js"
import Cache from "./cache/index.js"

Vue.use(Vuex)

export default new Vuex.Store({
  mutations: {
    setState(_, { module, state, callback }) {
      let module_state = this.state[module]
      if (typeof state === "function") {
        state = state(module_state)
      }
      module_state = this.state[module] = Object.assign(this.state[module], state)
      if (callback) callback(module_state)
    }
  },
  modules: {
    App,
    Info,
    Record,
    Rtc,
    Cache
  }
})
