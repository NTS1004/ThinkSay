<script>
import { funcPutInitInfo } from "@/api/info/index.js"
import { funGetChatRecordList, funGetApplyRecordList } from "@/api/record"
import { mapState, mapMutations, mapActions } from "vuex"
import { pathToBase64, base64ToPath } from "image-tools"
import ws from "@/utils/request/webSocket.js"
import { host } from "@/utils/config.js"

export default {
  data() {
    return {
      ws: null,
      id: null,
      ti: null
    }
  },
  computed: {
    ...mapState("App", ["lastPage"]),
    ...mapState("Info", ["info"])
  },
  onLaunch() {
    const { statusBarHeight, screenHeight } = uni.getSystemInfoSync()
    this.setState({
      module: "App",
      state: (state) => ({
        statusBarHeight,
        infoBoxHeight: state.infoBoxHeight + statusBarHeight
      })
    })
    let user_info = uni.getStorageSync("user-info")
    if (user_info) {
      this.init(user_info.id, user_info)
      setTimeout(() => {
        plus.navigator.closeSplashscreen()
      }, 200)
    } else {
      this.$u.route({
        type: "redirectTo",
        url: "/pages/login/index",
        animationType: "none"
      })
      setTimeout(() => {
        plus.navigator.closeSplashscreen()
      }, 600)
    }
    plus.push.addEventListener(
      "click",
      (msg) => {
        console.log(msg)
      },
      false
    )
    plus.push.addEventListener(
      "receive",
      (msg) => {
        console.log(msg)
      },
      false
    )
    plus.push.getClientInfoAsync(
      (info) => {
        console.log(info)
      },
      (err) => {
        console.log(err)
      }
    )
    uni.onWindowResize(({ size: { windowHeight } }) => {
      if (this.ti) {
        clearTimeout(this.ti)
      }
      this.ti = setTimeout(() => {
        let isCover
        if (windowHeight < 650) {
          isCover = true
        } else if (screenHeight <= windowHeight) {
          isCover = false
        } else {
          return
        }
        this.setState({
          module: "App",
          state: {
            isCover
          }
        })
      }, 300)
    })
  },
  onShow() {
    this.setState({
      module: "App",
      state: {
        isBackground: false
      }
    })
  },
  onHide() {
    this.setState({
      module: "App",
      state: {
        isBackground: true
      }
    })
  },
  methods: {
    ...mapMutations(["setState"]),
    ...mapMutations("App", ["getRecordFriendList"]),
    ...mapMutations("Info", ["setInfo"]),
    ...mapMutations("Record", [
      "handlerNewFriendsRecord",
      "setFriendsRecordInfo",
      "updateFriendInfo",
      "handlerChatRecordList",
      "handlerErrorChatRecord"
    ]),
    ...mapActions("App", ["getFriendList"]),
    ...mapActions("Record", ["handlerFriendsChatRecord"]),
    init(id, info) {
      this.id = id
      this.setInfo(info)
      this.connectWebSocket(id)
      this.initRecord(id)
    },
    initRecord(id) {
      let friend_record_info = uni.getStorageSync(`friends-record-info-${id}`) || {}
      this.setFriendsRecordInfo(friend_record_info)
      let user_record = uni.getStorageSync(`user-record-${id}`) || {}
      this.handlerChatRecordList(user_record)
      this.getRecordFriendList(user_record)
      this.getChatRecordList()
      this.getApplyRecordList(user_record)
      this.putInitInfo()
      this.getFriendList()
    },
    async putInitInfo() {
      let handlerInfo = this.deleteObjactKey(Object.assign({}, this.info), ["friends", "token", "quiet", "annoyed"])
      try {
        await funcPutInitInfo({ info: handlerInfo })
      } catch (err) {
        console.log(err)
      }
    },
    async getChatRecordList() {
      try {
        const { data } = await funGetChatRecordList()
        for (let i in data) {
          const { record } = data[i]
          for (let o = 0; o < record.length; o++) {
            const { image_src = "" } = record[o]
            let isBase64 = image_src.indexOf("base64") !== -1
            if (image_src && isBase64) {
              let image_source_path = await base64ToPath(image_src)
              let [_, res] = await uni.compressImage({
                src: image_source_path,
                quality: 20
              })
              const { tempFilePath } = res
              record[o].image_src = await pathToBase64(tempFilePath)
              record[o].image_source_path = image_source_path
            }
          }
          data[i].record = record
        }
        this.receive({ type: "chat", record: data })
      } catch (err) {
        console.log(err)
      }
    },
    async getApplyRecordList(user_record) {
      try {
        const { data } = await funGetApplyRecordList()
        this.receive({ type: "apply", apply_list: data })
      } catch (err) {
        this.handlerNewFriendsRecord(user_record)
      }
    },
    connectWebSocket(id) {
      this.ws = new ws(`ws://${host}?id=${id}`, this.receive)
    },
    deleteObjactKey(data, keys) {
      let json = {}
      for (let i in data) {
        if (!keys.includes(i) && !i.includes("cache")) {
          if (typeof data[i] === "object") {
            let handler_value = {}
            for (let c in data[i]) {
              if (!c.includes("cache") && !c.includes("height")) {
                handler_value[c] = data[i][c]
              }
            }
            data[i] = handler_value
          }
          json[i] = data[i]
        }
      }
      return json
    },
    receive(data) {
      const { type, friendId, info, record, apply_list, extend_error } = data
      switch (type) {
        case "chat":
          this.handlerFriendsChatRecord(record)
          break
        case ["voice", "video"].includes(type):
          this.setState({
            module: "Rtc",
            state: {
              rtc_type: type,
              rtc_status: "receive",
              rtc_info: info
            },
            callback: () => {
              this.$u.route({
                url: "/pages/rtc/index",
                animationType: "zoom-fade-out"
              })
            }
          })
          break
        case "chat-error":
          this.handlerErrorChatRecord({ friendId, record, extend_error })
          break
        case "apply":
          if (!apply_list) apply_list = [{ userId: friendId, info }]
          let user_record = uni.getStorageSync(`user-record-${this.id}`) || {}
          for (let i = 0; i < apply_list.length; i++) {
            const { userId, info } = apply_list[i]
            if (!user_record[userId]) {
              user_record[userId] = {}
              this.setState({
                module: "Info",
                state: {
                  friend_tips: true
                }
              })
            }
            user_record[userId].new_friends_record_msg = `你好, 我是${info.name}`
            if (!user_record[userId].status) user_record[userId].status = "verify"
            this.updateFriendInfo({ friendId: userId, info, user_record })
          }
          this.handlerNewFriendsRecord(user_record)
          break
        case "update":
          this.updateFriendInfo({ friendId, info })
          break
        case "out":
          this.ws.close()
          uni.removeStorageSync("user-info")
          this.$u.route({
            type: "redirect",
            url: "/pages/login/index"
          })
          this.$Toast("服务器突然抽风")
          break
      }
    }
  }
}
</script>

<style src="./static/css/iconfont.css"></style>
<style src="./static/font/font.css"></style>
<style lang="scss">
@import "uview-ui/index.scss";
.status_bar {
  height: var(--status-bar-height);
  width: 100%;
}
</style>
