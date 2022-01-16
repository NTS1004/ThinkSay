import axios from "@/utils/request/axios.js"
import {
	friend
} from "../base-url.js"

export function funcGetFriendList() {
	return axios.get(`${friend}/list`)
}

export function funcGetSearchFriends(params) {
	return axios.get(`${friend}/search`, {
		params
	})
}

export function funcDeleteFriend(params) {
	return axios.delete(`${friend}/delete`, params)
}

export function funcPutFriendApply(params) {
	return axios.put(`${friend}/apply`, params)
}

export function funcPutFriendAccept(params) {
	return axios.put(`${friend}/accept`, params)
}

export function funcPutFriendSetShield(shield, params) {
	return axios.put(`${friend}/set/${shield}`, params)
}
