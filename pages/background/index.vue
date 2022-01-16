<template>
	<view class="background">
		<Header title="背景设置" @back="goHome"></Header>
		<u-tabs-swiper ref="tabs" :current="current" :list="list" :is-scroll="false" active-color="#52acff" :active-item-style="{ color: '#52acff' }" font-size="28" @change="clickTab"></u-tabs-swiper>
		<swiper class="swiper" :current="current" @change="setCurrent">
			<swiper-item class="swiperItem">
				<scroll-view class="scroll" scroll-y="true" style="height: 100%">
					<view
						v-for="(item, index) in background"
						:key="index"
						:class="['background-item', index === background.length - 1 ? 'bottom-none' : '']"
						:style="itemInfo({ url: item.url, position: item.position })"
						@tap="goSetBackground(item)"
					>
						<view class="select-active" v-if="item.url === info.background.url"><u-icon name="checkbox-mark" class="icon"></u-icon></view>
					</view>
					<view style="height: 26rpx;"></view>
				</scroll-view>
			</swiper-item>
			<swiper-item>
				<scroll-view class="scroll" scroll-y="true" style="height: 100%">
					<view v-for="(item, index) in gradual" :key="index" :class="['background-item', index === gradual.length - 1 ? 'bottom-none' : '']" :style="itemInfo({ url: item.url })" @tap="putMyInfo(item)">
						<view class="select-active" v-if="item.url === info.background.url"><u-icon name="checkbox-mark" class="icon"></u-icon></view>
					</view>
					<view style="height: 26rpx;"></view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
import Header from '@/componets/Header/index.vue'
import { background, gradual } from './utils.js'
import { mapState, mapMutations } from 'vuex'
import { funcPutMyInfo } from '@/api/info/index.js'
export default {
	components: {
		Header
	},
	data() {
		return {
			background,
			gradual,
			list: [
				{
					name: '推荐'
				},
				{
					name: '渐变'
				}
			],
			current: 0
		}
	},
	computed: {
		...mapState('Info', ['info']),
		itemInfo() {
			return info => {
				let { url, position } = info
				let backgroundPosition = {}
				if (position) {
					backgroundPosition = {
						backgroundPosition: position
					}
				}
				return { backgroundImage: `url(${url})`, ...backgroundPosition }
			}
		}
	},
	methods: {
		...mapMutations('Info', ['setInfo']),
		async putMyInfo(data) {
			uni.showLoading({
				title: '设置中...'
			})
			let background = JSON.stringify({
				url: data.url,
				top: 0
			})
			try {
				const { data } = await funcPutMyInfo({ type: 'background', background })
				this.setInfo({ ...this.info, ...data })
			} catch (err) {
				console.log(err)
			}
			uni.hideLoading()
		},
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
				url: '/pages/set-background/index',
				params,
				animationType: "fade-in"
			})
		}
	}
}
</script>

<style scoped lang="scss" src="./background.scss"></style>
