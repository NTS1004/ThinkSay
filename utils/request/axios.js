import request from 'luch-request'
import qs from "qs"
import Toast from '@/utils/toast.js'
import Modal from '@/utils/modal.js'

const axios = new request()

let BASE_URL

if (alert) {
	BASE_URL = ''
} else if (process.env.NODE_ENV === 'development') {
	BASE_URL = 'http://192.168.1.102:1437'
} else if (process.env.NODE_ENV === 'production') {
	BASE_URL = 'http://192.168.1.101:1437' //http://192.168.1.102:1437
}

axios.setConfig((config) => {
	config.baseURL = BASE_URL
	return config
})

axios.interceptors.request.use(
	(config) => {
		const {
			url
		} = config
		let user_info = uni.getStorageSync('user-info')
		if (user_info) {
			const {
				id,
				token
			} = user_info
			config.header["auth-token"] = token
			if (config.url.indexOf('ID') !== -1) {
				config.url = url.replace("ID", id)
			}
		}
		return config
	}
)

axios.interceptors.response.use(
	(response) => {
		const {
			data
		} = response
		const {
			status,
			message
		} = data
		if (message) {
			if (status === "error") {
				const {
					title,
					content
				} = message
				if (title) {
					Modal({
						title,
						content
					})
				} else {
					Toast(content)
				}
			} else {
				if (message) {
					Toast(message)
				}
			}
		}
		if (status === "error") {
			throw new Error(message)
		} else {
			return data
		}
	},
	(error) => {
		throw error
	}
)

export default axios
