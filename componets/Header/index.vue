<template>
	<view>
		<view class="status_bar"></view>
		<view class="header" :style="headerStyle">
			<view :class="['iconfont', leftIcon, 'uIcon']" :style="leftStyle" @tap="$emit('back')"></view>
			<view class="title" :style="titleStyle">
				<view v-if="!$slots.title">
					{{ title }}
				</view>
				<slot name="title"></slot>
			</view>
			<slot name="header-right"></slot>
		</view>
	</view>
</template>
<script>
export default {
	props: {
		title: {
			type: String,
			default: ''
		},
		headerStyle: {
			type: Object,
			default: () => {}
		},
		leftStyle: {
			type: Object,
			default: () => {}
		},
		titleStyle: {
			type: Object,
			default: () => {}
		},
		leftIcon: {
			type: String,
			default: 'icon-zuojiantou'
		}
	}
}
</script>

<style scoped lang="scss">
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	color: #434343;
	position: relative;
	padding: 25rpx 30rpx;
	.uIcon {
		font-size: 45rpx;
	}
	.title {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 30rpx;
		width: 300rpx;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>
