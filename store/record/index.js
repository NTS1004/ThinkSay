import moment from "moment"
import Toast from "@/utils/toast.js"

export default {
	namespaced: true,
	state: {
		// 申请好友列表
		new_friends_record: {},
		// 聊天列表
		chat_record_list: [],
		// 朋友信息
		friends_record_info: {},
		// 当前朋友的聊天记录列表
		friend_chat_record: {},
		// 最近开始聊天时间
		last_chat_time: "",
		// 最新聊天时间
		update_chat_time: "",
		// 聊天记录是否全加载完成
		last_page: false,
		friends_list_record: {},
		// 保存下当前聊天记录的Index
		last_index: null
	},
	mutations: {
		// 更新朋友信息记录
		updateFriendInfo(state, {
			friendId,
			info,
			user_record
		}) {
			const { friends_record_info } = state
			friends_record_info[friendId] = Object.assign(friends_record_info[friendId] || {}, info)
			state.friends_record_info = friends_record_info
			const { initials } = state.friends_record_info[friendId] || info
			let chat_friend_id = this.state.Info.chat_friend_id
			console.log(friends_record_info[friendId])
			if (Number(chat_friend_id) === Number(friendId)) {
				this.commit("Info/setFriendInfo", friends_record_info[friendId])
			}
			if (info.initials !== initials) {
				this.commit("App/updateFriendData", {
					current_initials: initials,
					next_initials: info.initials,
					info: friends_record_info[friendId]
				})
			}
			const { id: myId } = this.state.Info.info
			if (!user_record) {
				user_record = uni.getStorageSync(`user-record-${myId}`)
			}
			user_record[friendId].info = friends_record_info[friendId]
			uni.setStorageSync(`user-record-${myId}`, user_record)
		},
		setFriendsRecordInfo(state, data) {
			state.friends_record_info = data
		},
		// 初始化聊天
		initFriendChatRecord(state, friendId) {
			const { id: myId } = this.state.Info.info
			let user_record = uni.getStorageSync(`user-record-${myId}`)
			const {
				last_chat_time,
				update_chat_time
			} = user_record[friendId]
			state.last_chat_time = last_chat_time || ""
			state.update_chat_time = update_chat_time || ""
		},
		// 处理发送的消息，展示在列表
		handerFriendChatRecord(state, {
			last_chat_time,
			record
		}) {
			const {
				chatTime
			} = record
			let friend_chat_record = state.friend_chat_record
			if (!friend_chat_record[last_chat_time]) friend_chat_record[last_chat_time] = []
			friend_chat_record[last_chat_time].push(record)
			state.friend_chat_record = friend_chat_record
			state.last_chat_time = last_chat_time
			state.update_chat_time = chatTime
			state.last_index = friend_chat_record[last_chat_time].length - 1
		},
		// 处理发送错误的信息
		handlerErrorChatRecord(state, { friendId, record, extend_error }) {
			const { chat_friend_id } = this.state.Info
			const { friend_chat_record } = state
			const { tip } = record
			const { last_chat_time, index } = extend_error
			if (Number(chat_friend_id) === Number(friendId)) {
				friend_chat_record[last_chat_time][index].send_error = true
				friend_chat_record[last_chat_time].splice(index + 1, 0, record)
				state.friend_chat_record = Object.assign({}, friend_chat_record)
			} else {
				const { id: myId } = this.state.Info.info
				let user_record = uni.getStorageSync(`user-record-${myId}`)
				const { chat_record_details } = user_record[friendId]
				chat_record_details[last_chat_time][index].send_error = true
				chat_record_details[last_chat_time].splice(index + 1, 0, record)
				user_record[friendId].chat_record_details = chat_record_details
				this.commit('Record/handlerChatRecordList', user_record)
				uni.setStorageSync(`user-record-${myId}`, user_record)
			}
			this.commit("Record/updateFriendInfo", {friendId, info: {
				[tip]: tip === 'friend' ? 0 : 1
			}})
		},
		// 保存聊天记录
		saveFriendChatRecord(state, friendId) {
			const { friend_chat_record } = state
			if (!Object.keys(friend_chat_record).length) return
			const { id: myId } = this.state.Info.info
			let user_record = uni.getStorageSync(`user-record-${myId}`)
			let friend_chat_record_details = user_record[friendId].chat_record_details || {}
			let friend_chat_record_keys = Object.keys(friend_chat_record)
			let last_record_key = friend_chat_record_keys[friend_chat_record_keys.length - 1]
			let last_record_value = friend_chat_record[last_record_key]
			let last_record = last_record_value[last_record_value.length - 1]
			user_record[friendId].new_chat_record = last_record
			user_record[friendId].last_chat_time = last_record_key
			user_record[friendId].update_chat_time = last_record.chatTime
			user_record[friendId].chat_record_details = Object.assign({}, friend_chat_record_details, friend_chat_record)
			uni.setStorageSync(`user-record-${myId}`, user_record)
			this.commit('Record/handlerChatRecordList', user_record)
		},
		// 清除聊天状态
		clearFriendChatRecord(state) {
			state.friend_chat_record = {}
			state.last_chat_time = ""
			state.update_chat_time = ""
			state.last_page = false
			this.commit("Info/setChatFriendId", null)
		},
		hanlderFriendsRecordInfo(state, data) {
			const { id: myId } = this.state.Info.info
			let friends_record_info = {}
			for (let i in data) {
				friends_record_info[i] = data[i].info
			}
			state.friends_record_info = friends_record_info
			uni.setStorageSync(`friends-record-info-${myId}`, friends_record_info)
		},
		handlerNewFriendsRecord(state, data) {
			let filter_data = []
			for (let i in data) {
				const {
					info,
					new_friends_record_msg,
					status
				} = data[i]
				if (new_friends_record_msg) {
					filter_data.push({
						...info,
						status,
						msg: new_friends_record_msg
					})
				}
			}
			let new_friends_record_data = {}
			for (let i = 0; i < filter_data.length; i++) {
				const {
					initials
				} = filter_data[i]
				if (!new_friends_record_data[initials]) new_friends_record_data[initials] = []
				filter_data[i].index = new_friends_record_data[initials].length
				new_friends_record_data[initials].push(filter_data[i])
			}
			state.new_friends_record = new_friends_record_data
		},
		setNewFriendsRecordStatus(state, {
			initials,
			index
		}) {
			let new_friends_record = state.new_friends_record
			new_friends_record[initials][index].status = "friend"
			state.new_friends_record = new_friends_record
		},
		handlerChatRecordList(state, data = {}) {
			if (Object.keys(data).length == 0) {
				let { id: myId } = this.state.Info.info
				data = uni.getStorageSync(`user-record-${myId}`)
			}
			let filter_data = []
			for (let i in data) {
				const {
					info,
					new_chat_record,
					badge_count
				} = data[i]
				if (new_chat_record) {
					filter_data.push({
						...info,
						...new_chat_record,
						badge_count
					})
				}
			}
			filter_data = filter_data.sort((current, next) => {
				return moment(next.chatTime) > moment(current.chatTime)
			})
			state.chat_record_list = filter_data
		},
		setLastChatTime(state, last_chat_time) {
			state.last_chat_time = last_chat_time
		},
		setUpdateChatTime(state, update_chat_time) {
			state.update_chat_time = update_chat_time
		},
		setLastPage(state, bool) {
			state.last_page = bool
		},
		loadFriendChatRecord(state, data) {
			state.friend_chat_record = {
				...data,
				...state.friend_chat_record
			}
		},
		clearBadgeCount(_, friendId) {
			const {
				id: myId
			} = this.state.Info.info
			let user_record = uni.getStorageSync(`user-record-${myId}`)
			user_record[friendId].badge_count = 0
			uni.setStorageSync(`user-record-${myId}`, user_record)
			this.commit("Record/handlerChatRecordList", user_record)
		},
		//退出登录后清除当前用户的记录信息
		clearRecord(state) {
			state.new_friends_record = {}
			state.chat_record_list = []
			state.friends_record_info = {}
			this.commit("Record/clearFriendChatRecord")
		}
	},
	actions: {
		async handlerFriendsChatRecord({
			commit
		}, data) {
			const { id: myId} = this.state.Info.info
			let user_record = uni.getStorageSync(`user-record-${myId}`)
			let chat_friend_id = this.state.Info.chat_friend_id
			let update_friend
			for (let i in data) {
				let {
					info,
					record = [],
					badge_count = 0,
					update
				} = data[i]
				if (!user_record[i]) {
					user_record[i] = {}
					user_record[i].info = info
					user_record[i].badge_count = 0
				}
				const new_record = record[record.length - 1]
				const {
					key,
					msg,
					tips = [],
					chatTime
				} = new_record
				// 时间逻辑
				let {
					update_chat_time,
					last_chat_time,
					chat_record_details
				} = user_record[i]
				let overtime = moment() > moment(update_chat_time || chatTime).add(5, "minute")
				if (!last_chat_time || overtime) {
					user_record[i].last_chat_time = chatTime
					last_chat_time = chatTime
				}
				user_record[i].update_chat_time = chatTime
				// 最新记录
				const new_tip = tips[tips.length - 1]
				user_record[i].new_chat_record = new_record
				if (chat_friend_id == i) {
					if (msg) {
						commit("handerFriendChatRecord", {
							last_chat_time,
							record: Object.assign({
								key,
								msg,
								chatTime
							})
						})
					}
					if (tips.length > 0) {
						for (let c = 0; c < tips.length; c++) {
							commit("handerFriendChatRecord", {
								last_chat_time,
								record: Object.assign({
									key: 'tip',
									tip: tips[c],
									chatTime
								})
							})
						}
					}
					badge_count = 0
					commit("setLastChatTime", last_chat_time)
					commit("setUpdateChatTime", update_chat_time)
				}
				// 角标
				user_record[i].badge_count += badge_count
				// 是否更新好友列表
				update_friend = update

				// 更新聊天记录列表
				commit("handlerChatRecordList", user_record)
				// 储存聊天记录
				if (!chat_record_details) chat_record_details = {}
				if (!chat_record_details[last_chat_time]) chat_record_details[last_chat_time] = []
				for (let o = 0; o < record.length; o++) {
					const {
						key,
						msg,
						tips,
						image_src,
						image_width,
						image_height,
						chatTime
					} = record[o]
					if (msg || image_src) {
						chat_record_details[last_chat_time].push({
							key,
							msg,
							image_src,
							image_width,
							image_height,
							chatTime
						})
					}
					if (tips) {
						for (let t = 0; t < tips.length; t++) {
							chat_record_details[last_chat_time].push({
								key: 'tip',
								tip: tips[t],
								chatTime
							})
						}
					}
				}
				user_record[i].chat_record_details = chat_record_details
			}
			if (update_friend) {
				this.dispatch("App/getFriendList")
				this.commit("Info/setInfoType", "friend")
			}
			uni.setStorageSync(`user-record-${myId}`, user_record)
		},
		async getFriendChatRecordList({
			commit
		}, {
			friendId,
			pageNumber = 0,
			currentIndex
		}) {
			const {
				id: myId
			} = this.state.Info.info
			let user_record = await uni.getStorageSync(`user-record-${myId}`)
			let friend_chat_record_details = user_record[friendId].chat_record_details || {}
			let record_details_key_arr = Object.keys(friend_chat_record_details).reverse()
			let pageSize = 10
			pageSize = !pageNumber ? pageSize : currentIndex + pageNumber * pageSize
			let select_record_key = record_details_key_arr.slice(currentIndex || pageNumber, pageSize).reverse()
			let data = {}
			let last_page = false
			for (let i = 0; i < select_record_key.length; i++) {
				let chatTime = select_record_key[i]
				data[chatTime] = friend_chat_record_details[chatTime]
				if (chatTime === record_details_key_arr[record_details_key_arr.length - 1]) {
					last_page = true
				}
			}
			if (Object.keys(data).length === 0) last_page = true
			commit("setLastPage", last_page)
			commit("loadFriendChatRecord", data)
		}
	}
}
