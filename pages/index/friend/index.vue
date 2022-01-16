<template>
	<scroll-view class="scroll" scroll-y="true" style="height: 100%">
		<view class="friend">
			<FriendGroup v-for="(value, key) in friend_data" :key="key" :avatarSize="92" :groupKey="key" :data="value" @Tap="toFriendChat"></FriendGroup>
		</view>
	</scroll-view>
</template>

<script>
import FriendGroup from '@/componets/FriendGroup/index.vue'
import { mapState } from 'vuex'
export default {
	components: {
		FriendGroup
	},
	computed: {
		...mapState('App', ['friend_data'])
	},
	methods: {
		toFriendChat(info) {
			this.$emit('toFriendChat', info)
		}
	}
}
</script>

<style scoped lang="scss" src="./friend.scss"></style>
