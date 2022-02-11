<template>
  <view class="background">
    <Header title="背景设置" @back="goHome"></Header>
    <u-tabs-swiper
      ref="tabs"
      :current="current"
      :list="classification"
      :is-scroll="false"
      active-color="#52acff"
      :active-item-style="{ color: '#52acff' }"
      font-size="28"
      @change="clickTab"
    ></u-tabs-swiper>
    <swiper class="swiper" :current="current" @change="setCurrent">
      <swiper-item v-for="(item, index) in background" :key="index" class="swiperItem">
        <scroll-view class="scroll" scroll-y="true" style="height: 100%">
          <view
            v-for="(i, iIndex) in item"
            :key="iIndex"
            :class="['background-item']"
            :style="itemInfo(i)"
            @tap="goSetBackground(i)"
          >
            <view class="select-active" v-if="i.url === info.background.url">
              <u-icon name="checkbox-mark" class="icon"></u-icon>
            </view>
          </view>
          <view style="height: 26rpx"></view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import Header from "@/componets/Header/index.vue"
import { mapState, mapMutations } from "vuex"
import { classification, background } from "./utils/pageData.js"

export default {
  components: {
    Header
  },
  data() {
    return {
      classification,
      background,
      current: 0
    }
  },
  computed: {
    ...mapState("Info", ["info"]),
    itemInfo() {
      return (info) => {
        let { url, position } = info
        return { backgroundImage: `url(${url})`, backgroundPosition: position || "center" }
      }
    }
  },
  methods: {
    clickTab(v) {
      this.current = v
    },
    setCurrent(v) {
      const { current } = v.detail
      this.current = current
    },
    goHome() {
      this.$u.route({
        type: "navigateBack"
      })
    },
    goSetBackground(params) {
      const { url, top } = this.info.background
      params.top = params.url === url ? top : 0
      this.$u.route({
        url: "/pages/set-background/index",
        params,
        animationType: "fade-in"
      })
    }
  }
}
</script>

<style scoped lang="scss" src="./background.scss"></style>
