import request from 'luch-request'
import Toast from '@/utils/toast.js'
import Modal from '@/utils/modal.js'
import { host } from '@/utils/config.js'

const axios = new request()

let BASE_URL

if (alert) {
	BASE_URL = ''
} else {
	BASE_URL = `http://${host}`
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
