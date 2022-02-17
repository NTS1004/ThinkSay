import store from "@/store/index.js"
import Toast from "@/utils/toast.js"

class ws {
  constructor(url, receive) {
    this.url = url
    this.receive = receive
    this.is_click_close = false
    this.keepInterval = null
    this.reconnectTimeout = null
    this.networkStatus = false
    this.connectError = false
    uni.getNetworkType({
      success: (res) => {
        const { networkType } = res
        if (networkType === "none") {
          this.connectError = true
          this.networkStatus = false
          store.commit("setState", {
            module: "App",
            state: {
              network_status: false
            }
          })
        } else {
          this.connect()
          this.networkStatus = true
          store.commit("setState", {
            module: "App",
            state: {
              network_status: true
            }
          })
        }
      }
    })
    uni.onNetworkStatusChange((res) => {
      const { isConnected } = res
      if (isConnected) {
        this.connect()
      } else {
        if (!store.state.App.isBackground) {
          Toast("当前网络不可用╥﹏╥...")
        }
      }
      this.networkStatus = isConnected
      store.commit("setState", {
        module: "App",
        state: {
          network_status: isConnected
        }
      })
    })
  }
  connect() {
    this.socketTask = uni.connectSocket({
      url: this.url,
      success: () => {
        console.log("开始连接...")
        return this.socketTask
      }
    })
    this.socketTask.onOpen(() => {
      console.log("连接成功")
	  store.commit("setState", {
		  module: "App",
		  state: {
			  ws_connect: true
		  }
	  })
      if (this.connectError) {
        getApp().initRequest(getApp().id)
        this.connectError = false
      }
      this.is_click_close = false
      this.ping()
    })
    this.socketTask.onMessage(async (msg) => {
      const { data } = msg
      if (Array.isArray(JSON.parse(data))) {
        let channel = JSON.parse(data)
        for (let i = 0; i < channel.length; i++) {
          await this.receive(channel[i])
        }
      } else {
        const { type } = JSON.parse(data)
        if (type === "ping") return
        this.receive(JSON.parse(data))
      }
    })
    this.socketTask.onClose(() => {
      console.log("断开连接")
      if (!this.is_click_close) {
        this.reconnect()
      }
    })
    this.socketTask.onError((e) => {
      console.log("连接失败")
	  if (!this.connectError) {
		  store.commit("setState", {
		  		  module: "App",
		  		  state: {
		  			  ws_connect: false
		  		  }
		  })
		  this.connectError = true
	  }
      setTimeout(() => {
        if (this.networkStatus) {
          this.reconnect()
        }
      }, 1000)
    })
  }
  reconnect() {
    console.log("重新连接中...")
    clearInterval(this.keepInterval)
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, 2000)
  }
  ping() {
    this.keepInterval = setInterval(() => {
      this.emit({
        type: "ping"
      })
    }, 500)
  }
  emit(data) {
    data = JSON.stringify(data)
    this.socketTask.send({
      data
    })
  }
  close() {
    this.is_click_close = true
    this.socketTask.close()
  }
}

module.exports = ws
