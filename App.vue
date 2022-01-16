<script>
import { funcPutInitInfo } from "@/api/info/index.js"
import { funGetChatRecordList, funGetApplyRecordList } from "@/api/record"
import { mapState, mapMutations, mapActions } from "vuex"
import ws from "@/utils/request/webSocket.js"
import { host } from "@/utils/config.js"

export default {
  data() {
    return {
      ws: null,
      id: null
    }
  },
  computed: {
    ...mapState("App", ["lastPage"]),
	...mapState("Info", ['info'])
  },
  onLaunch() {
    uni.getSystemInfo({
      success: (res) => {
        const { statusBarHeight } = res
        this.setStatusBarHeight(statusBarHeight)
      }
    })
    let user_info = uni.getStorageSync("user-info")
    if (user_info) {
      this.init(user_info.id, user_info)
      plus.navigator.closeSplashscreen()
    } else {
      this.$u.route({
        type: "redirectTo",
        url: "/pages/login/index",
        animationType: "none"
      })
      setTimeout(() => {
        plus.navigator.closeSplashscreen()
      }, 500)
    }
  },
  onShow() {
    this.setIsBackground(false)
  },
  onHide() {
    this.setIsBackground(true)
  },
  methods: {
    ...mapMutations("App", ["setNetworkStatus", "setStatusBarHeight", "setIsBackground", "getRecordFriendList"]),
    ...mapMutations("Info", ["setInfo", "setFriendTips", "setInfoType"]),
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
      let friend_record_info = uni.getStorageSync(`friends-record-info-${id}`) || {}
      this.setFriendsRecordInfo(friend_record_info)
      let user_record = uni.getStorageSync(`user-record-${this.id}`) || {}
      this.handlerChatRecordList(user_record)
      this.getRecordFriendList(user_record)
      this.getChatRecordList()
      this.getApplyRecordList(user_record)
    },
	async putInitInfo() {
		let handlerInfo = this.deleteObjactKey(this.info, ['friends', 'token', 'quiet', 'annoyed'])
		try {
			await funcPutInitInfo({ info: handlerInfo })
		} catch (err) {
			console.log(err)
		}
	},
    async getChatRecordList() {
      try {
        const { data } = await funGetChatRecordList()
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
			if (keys.indexOf(i) === -1) {
				json[i] = data[i]
			}
		}
		return json
	},
    receive(data) {
      const { type, friendId, info, record, apply_list, extend_error } = data
      switch (type) {
        case "apply":
          if (!apply_list) apply_list = [{ userId: friendId, info }]
          let user_record = uni.getStorageSync(`user-record-${this.id}`) || {}
          for (let i = 0; i < apply_list.length; i++) {
            const { userId, info } = apply_list[i]
            if (!user_record[userId]) {
              user_record[userId] = {}
              this.setFriendTips(true)
            }
            user_record[userId].new_friends_record_msg = `你好, 我是${info.name}`
            user_record[userId].status = "verify"
            this.updateFriendInfo({ friendId: userId, info, user_record })
          }
          this.handlerNewFriendsRecord(user_record)
          break
        case "chat":
          this.handlerFriendsChatRecord(record)
          break
		case "chat-error":
		  this.handlerErrorChatRecord({ friendId, record, extend_error })
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
