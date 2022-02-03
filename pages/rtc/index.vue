<template>
	<view class="rtc" :style="background">
		<Header left-icon="icon-suoxiao" :header-style="headerStyle" :title-style="titleStyle" @back="windowing">
			<view slot="title">
				<view class="title-box" style="position: relative;" v-if="rtc_status !== 'connected'">
					<view class="box">
						<view v-if="rtc_status === 'send'">
							等待对方接受
						</view>
						<view v-else>
							邀请你{{ rtc_type === 'voice' ? '语音通话' : '视频聊天' }}
						</view>
						<view class="dot">...</view>
					</view>
				</view>
			</view>
		</Header>
		<view class="friend">
			<u-avatar class="avatar" mode="square" size="160" :src="rtc_info.avatar"></u-avatar>
			<view class="name">{{ rtc_info.name }}</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	import Header from '@/componets/Header/index.vue'
	export default {
		components: {
			Header
		},
		data() {
			return {
				headerStyle: {
					color: '#fff',
				},
				leftStyle: {
					textShadow: '0px 0px 2px #434343, 0px 0px 20px #ffffff;'
				},
				titleStyle: {
					textShadow: '0px 0px 2px #434343, 0px 0px 20px #434343'
				}
			}
		},
		computed: {
			...mapState('App', ['statusBarHeight']),
			...mapState('Rtc', ['rtc_type', 'rtc_status', 'grounp', 'rtc_info']),
			top() {
				return `${this.statusBarHeight + 10}px`
			},
			background() {
				const { background } = this.rtc_info || {}
				if (this.rtc_type === 'voice' && !this.grounp && background) {
					const { url } = typeof background === 'string' ? JSON.parse(background) : background
					let backgroundImage = `background-image: url(${url})`
					return `${backgroundImage}`
				} else {
					return "background: #434343"
				}
			}
		},
		methods: {
			windowing() {
				this.$u.route({
					type: 'navigateBack'
				})
			}
		}
	}
</script>

<style scoped lang="scss" src="./index.scss"></style>
