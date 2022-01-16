<template>
	<view class="rtc">
		<view class="status_bar"></view>
		<view class="headIcon" :style="{ top }">
			<view class="iconfont icon-suoxiao uIcon" style="font-size: 45rpx;" @tap.stop="windowing"></view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	export default {
		computed: {
			...mapState('App', ['statusBarHeight']),
			...mapState('Info', ['friend_info']),
			...mapState('Rtc', ['rtc_info']),
			top() {
				return `${this.statusBarHeight + 10}px`
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
