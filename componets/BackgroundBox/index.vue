<template>
	<view :class="['background-box', radius ? 'radius' : '']">
		<view :class="['background', typeof this.top !== 'number' ? 'cover-height' : '']" :style="background"></view>
	</view>
</template>

<script>
export default {
	props: {
		url: {
			type: String,
			default: ''
		},
		top: {
			type: [Number, String],
			default: null
		},
		radius: {
			type: Boolean,
			default: true
		}
	},
	computed: {
		background() {
			let background
			if (this.top && typeof this.top === 'number') {
				background = `background-image: url(${this.url}); transform: translateY(-${this.top}px)`
			} else {
				background = `background-image: url(${this.url})`
			}
			return background
		}
	}
}
</script>

<style scoped lang="scss">
.background-box {
	position: absolute;
	width: 100%;
	height: 100%;
	z-index: -1;
	overflow: hidden;
	// border: 1px solid;
	.background {
		width: 100%;
		height: 100vh;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		// margin-top: 100px;
	}
	.cover-height {
		height: 100%;
	}
}
.radius {
	border-radius: 0 0 28rpx 28rpx;
}
</style>
