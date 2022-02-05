<template>
  <view class="chat">
    <Header :title="friend_info.name" :title-style="title_style" @back="toBack">
      <view class="right" slot="header-right">
        <view class="iconfont icon-shipintonghua uIcon" @tap="show = true"></view>
        <view class="iconfont icon-gengduo uIcon" style="margin-left: 26rpx" @tap="toDetails"></view>
      </view>
    </Header>
    <view class="body">
      <scroll-view
        class="scroll"
        :scroll-y="true"
        :style="{ height: `${scroll_height}px` }"
        :scroll-into-view="scroll_into_id"
        @scrolltoupper="scrollToUpper"
      >
        <view class="msg-record-block" v-for="(value, key) in friend_chat_record" :key="key">
          <view class="tips time">{{ hander_charTime(key, true) }}</view>
          <view v-for="(item, index) in value" :key="index">
            <view v-if="Number(item.key) === Number(info.id)" class="record my-record">
              <u-avatar class="avatar" mode="square" size="86" :src="info.avatar"></u-avatar>
              <view class="box">
                <view
                  v-if="item.send_error"
                  class="iconfont icon-cloud-error"
                  style="margin-right: 16rpx"
                  @tap="reSend(key, item, index)"
                ></view>
                <view
                  v-if="item.image_src"
                  :class="[{ image: item.image_src.indexOf('base64') !== -1 }]"
                  style="margin-right: 24rpx"
                >
                  <u-image
                    :src="item.image_src"
                    :lazy-load="true"
                    :width="`${item.image_width || 240}rpx`"
                    :height="`${item.image_height || 240}rpx`"
                    border-radius="8"
                    @tap="previewImage(item)"
                  ></u-image>
                </view>
                <view v-else>
                  <view class="msg my-msg">
                    <view>{{ item.msg }}</view>
                    <u-icon name="play-right-fill" class="icon my-icon"></u-icon>
                  </view>
                </view>
              </view>
            </view>
            <view v-else-if="Number(item.key) !== Number(info.id) && item.key !== 'tip'" class="record friend-record">
              <u-avatar class="avatar" mode="square" size="86" :src="friend_info.avatar"></u-avatar>
              <view class="box">
                <view
                  v-if="item.image_src"
                  :class="{ image: item.image_src.indexOf('base64') !== -1 }"
                  style="margin-left: 24rpx"
                >
                  <u-image
                    :src="item.image_src"
                    :lazy-load="true"
                    :width="`${item.image_width || 240}rpx`"
                    :height="`${item.image_height || 240}rpx`"
                    border-radius="8"
                    @tap="previewImage(item)"
                  >
                  </u-image>
                </view>
                <view v-else>
                  <view class="msg friend-msg">
                    <view>{{ item.msg }}</view>
                    <u-icon name="play-left-fill" class="icon friend-icon"></u-icon>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="tips" v-html="ErrTipText(item.tip) || item.tip"></view>
          </view>
        </view>
        <view class="record_bottom" id="scrollBottom"></view>
      </scroll-view>
    </view>
    <view class="footer" :style="{ bottom: `${keyboard_height}px` }">
      <scroll-view
        class="textarea-scroll"
        :scroll-y="true"
        :scroll-with-animation="true"
        :scroll-into-view="text_scroll_into_id"
      >
        <u-input
          v-model="params.msg"
          class="input"
          type="textarea"
          height="40"
          :maxlength="-1"
          placeholder="说你想说..."
          autoHeight
          :custom-style="{ padding: '2rpx 32rpx' }"
          :clearable="false"
          @linechange="linechange"
          @input="handerMsg"
        >
        </u-input>
        <view class="record_bottom" id="textScrollBottom"></view>
      </scroll-view>
      <view class="iconfont icon-fuwenbenbianjiqi_tupian uIcon" style="font-size: 44rpx" @tap="selectImage"></view>
      <view
        :class="['iconfont', 'icon-fasong', 'uIcon', params.msg ? 'status' : '']"
        style="margin: 0 24rpx 0 26rpx"
        @tap="send"
      >
      </view>
    </view>
    <u-action-sheet :list="list" v-model="show" @click="selectConnect"></u-action-sheet>
  </view>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex"
import { pathToBase64, base64ToPath } from "image-tools"
import Header from "@/componets/Header/index.vue"
import hander_charTime from "@/utils/hander_chatTime.js"

export default {
  components: {
    Header
  },
  data() {
    return {
      load: false,
      params: {},
      friendId: null,
      show: false,
      pageNumber: 0,
      scroll_height: 0,
      keyboard_height: 0,
      scroll_into_id: "",
      text_scroll_into_id: "",
      screen_height: 0,
      title_style: {
        fontFamily: "Permanent Marker"
      },
      list: [
        {
          text: "语音通话"
        },
        {
          text: "视频聊天"
        }
      ]
    }
  },
  computed: {
    ...mapState("App", ["statusBarHeight", "network_status"]),
    ...mapState("Info", ["info", "friend_info"]),
    ...mapState("Record", [
      "friend_chat_record",
      "last_chat_time",
      "update_chat_time",
      "last_page",
      "last_index",
      "previewImages"
    ]),
    headerHeight() {
      return this.statusBarHeight + uni.upx2px(95)
    },
    ErrTipText() {
      const { name = "" } = this.friend_info
      let errTipText = {
        network_status: "没有网络你发什么信息啊(╬▔皿▔)凸",
        friend: `${name}已经把你删了(ˉ▽ˉ；)...`,
        annoyed: `${name}已将你拉入了黑名单╮(╯▽╰)╭`
      }
      return (tip) => {
        return errTipText[tip]
      }
    }
  },
  onLoad(params) {
    let systemInfo = uni.getSystemInfoSync()
    this.screen_height = systemInfo.screenHeight
    const { friendId } = params
    if (friendId) {
      this.friendId = friendId
      this.initFriendChat(friendId)
      this.clearBadgeCount(friendId)
      this.getFriendChatRecordList({
        friendId
      }).then(() => {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      })
    }
    uni.onKeyboardHeightChange((res) => {
      const { height } = res
      this.keyboard_height = height
      this.linechange()
    })
  },
  onReady() {
    this.load = true
  },
  methods: {
    ...mapMutations("Info", ["setInfoType", "setFriendInfo", "initFriendChat", "setChatFriendId"]),
    ...mapMutations("Record", [
      "handerFriendChatRecord",
      "saveFriendChatRecord",
      "defaultFriendChatRecord",
      "clearBadgeCount",
      "clearFriendChatRecord",
      "deleteOneFriendChatRecord"
    ]),
    ...mapMutations("Rtc", ["setState"]),
    ...mapActions("Record", ["getFriendChatRecordList"]),
    hander_charTime,
    // 发送信息
    async send({ msg, image_src, image_width, image_height, image_source, image_source_path }) {
      let { friendId, params, info, last_chat_time, update_chat_time, friend_info, network_status } = this
      msg = msg || params.msg
      const { friend, annoyed } = friend_info
      if (!msg && !image_src) return
      params.chatTime = this.$moment().format("YYYY-MM-DD HH:mm:ss")
      let overtime = this.$moment() > this.$moment(update_chat_time || params.chatTime).add(5, "minute")
      if (!last_chat_time || overtime) {
        last_chat_time = params.chatTime
      }
      let send_status = network_status && friend && !annoyed
      let record = Object.assign(
        {
          key: `${info.id}`,
          chatTime: params.chatTime,
          image_source,
          image_source_path
        },
        image_src
          ? {
              image_src,
              image_width,
              image_height,
              msg: image_src.indexOf("base64") !== -1 ? "[图片]" : "[表情]"
            }
          : {
              msg: msg || message
            },
        !send_status
          ? {
              send_error: true
            }
          : {}
      )
      let data = {
        last_chat_time,
        record
      }
      this.handerFriendChatRecord(data)
      if (send_status) {
        getApp().ws.emit({
          type: "chat",
          friendId,
          record,
          extend_error: {
            last_chat_time,
            index: this.last_index
          }
        })
      } else {
        let tip
        if (!network_status) {
          tip = "network_status"
        } else if (!friend) {
          tip = "friend"
        } else if (annoyed) {
          tip = "annoyed"
        }
        let errTipData = {
          last_chat_time,
          record: {
            key: "tip",
            tip: this.ErrTipText(tip),
            chatTime: this.$moment().format("YYYY-MM-DD HH:mm:ss")
          }
        }
        this.handerFriendChatRecord(errTipData)
      }
      this.params = {}
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    // 重发信息
    reSend(key, record, index) {
      this.deleteOneFriendChatRecord({ key, index })
      setTimeout(() => {
        this.send(record)
      }, 200)
    },
    // 发起语音通话或视频聊天
    selectConnect(index) {
      this.setState({
        rtc_type: index ? "video" : "voice",
        rtc_status: "send",
        rtc_info: this.friend_info
      })
      // getApp().ws.emit({
      //   type: this.rtc_type,
      //   friendId: this.friendId
      // })
      this.$u.route({
        url: "/pages/rtc/index",
        animationType: "zoom-fade-out"
      })
    },
    // 选择本地图片，并发送
    selectImage() {
      plus.gallery.pick(
        ({ files }) => {
          files.forEach((item) => {
            uni.getImageInfo({
              src: item,
              success: async ({ width, height, type, path }) => {
                let image_width
                let image_height
                if (width > height) {
                  if (Math.floor(width / 320) > 2) {
                    image_width = 320
                  } else {
                    image_width = 300
                  }
                  if (Math.floor(width / image_width) > 1) {
                    image_height = height / Math.floor(width / image_width)
                  } else {
                    image_height = height - (width - image_width)
                  }
                } else if (height > width) {
                  if (height >= 2400) {
                    image_height = 335
                  } else if (height >= 1920) {
                    image_height = 320
                  } else {
                    image_height = 300
                  }
                  if (Math.floor(height / image_height) > 1) {
                    image_width = width / Math.floor(height / image_height)
                  } else {
                    image_width = width - (height - image_height)
                  }
                } else if (width === height) {
                  image_width = 260
                  image_height = 260
                }
                let image_src
                let image_source
                let image_source_path
                if (type === "jpeg") {
                  let [_, res] = await uni.compressImage({
                    src: path,
                    quality: 20
                  })
                  const { tempFilePath } = res
                  image_src = await pathToBase64(tempFilePath)
                  image_source = await pathToBase64(path)
                  image_source_path = await base64ToPath(image_source)
                } else {
                  image_src = await pathToBase64(path)
                }
                this.send({
                  image_src,
                  image_width,
                  image_height,
                  image_source,
                  image_source_path
                })
              }
            })
          })
        },
        false,
        {
          multiple: true,
          maximum: 9
        }
      )
    },
    // 滚动到顶部事件
    scrollToUpper() {
      if (this.last_page) return
      this.pageNumber += 1
      const { friendId, pageNumber } = this
      let currentIndex = Object.keys(this.friend_chat_record).length
      this.getFriendChatRecordList({
        friendId,
        pageNumber,
        currentIndex
      })
    },
    scrollToBottom() {
      this.scroll_into_id = "scrollBottom"
      this.$nextTick(() => {
        this.scroll_into_id = ""
      })
    },
    textScrollToBottom() {
      this.text_scroll_into_id = "textScrollBottom"
      this.$nextTick(() => {
        this.text_scroll_into_id = ""
      })
    },
    // 根据input宽计算聊天记录区域的高度
    linechange() {
      const query = uni.createSelectorQuery()
      query
        .select(".footer")
        .boundingClientRect((data) => {
          const { height } = data
          let scroll_height = this.screen_height - this.headerHeight - this.keyboard_height - height
          this.scroll_height = scroll_height
          if (height >= 85) {
            this.$nextTick(() => {
              setTimeout(() => {
                this.textScrollToBottom()
              }, 100)
            })
          }
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        })
        .exec()
    },
    // 检测是否搜狗输入法表情包，是则弹起弹窗
    handerMsg(v) {
      if (v.indexOf("点击") !== -1 && v.indexOf("查看表情") !== -1 && v.indexOf("sogoucdn.com") !== -1) {
        this.$nextTick(() => {
          this.params.msg = ""
        })
        let src = v.split("[")[1].split("]")[0]
        let src_division = src.split(".")
        let suffix = src_division[src_division.length - 1]
        if (["jpg", "png", "jepg", "gif"].indexOf(suffix) !== -1) {
          uni.getImageInfo({
            src,
            success: ({ width, height }) => {
              this.$Modal({
                title: "发送以下图片?",
                src,
                isCancel: true,
                ok: () => this.send({ image_src: src, image_width: width, image_height: height })
              })
            }
          })
        }
      }
    },
    // 预览图片
    previewImage(record) {
      const { image_src, image_source_path, chatTime } = record
      let previewImages = Array.from(this.previewImages.values())
      let ImagesKeys = Array.from(this.previewImages.keys())
      let current = ImagesKeys.indexOf(chatTime)
      let previewImage = image_source_path || image_src
      let isGif = previewImage.indexOf(".gif") !== -1
      if (isGif) {
      } else {
        uni.previewImage({
          current,
          urls: previewImages
        })
      }
    },
    toBack() {
      this.$u.route({
        type: "navigateBack"
      })
      this.$nextTick(() => {
        this.setFriendInfo()
      })
    },
    toDetails() {
      this.setInfoType("friend")
      this.$u.route({
        url: "/pages/info/index"
      })
    }
  },
  onShow() {
    if (this.load) {
      this.setChatFriendId(this.friendId)
    }
  },
  onHide() {
    this.saveFriendChatRecord(this.friendId)
    this.setChatFriendId(null)
  },
  onUnload() {
    this.saveFriendChatRecord(this.friendId)
  }
}
</script>

<style scoped lang="scss" src="./chat.scss"></style>
