const crypto = require("crypto")
const moment = require("moment")
const axios = require("../../utils/axios")

class push {
  constructor() {
    this.appId = "gx8CdqJncsA0fxxmRrWta3"
    this.appKey = "B2nf9JvHfi7UqQcUXvODd2"
    this.masterSecret = "NvSaGdOVbcAg1ey7XPaPY"
    this.baseUrl = `https://restapi.getui.com/v2/${this.appId}`
    this.token = ""
    this.refreshTi = null
    this.auth()
  }
  async auth() {
    const timestamp = Date.now()
    const sign = crypto.createHash("sha256").update(`${this.appKey}${timestamp}${this.masterSecret}`).digest("hex")
    const body = {
      timestamp,
      sign,
      appkey: this.appKey
    }
    try {
      const { data } = await axios.post(`${this.baseUrl}/auth`, body)
      const { token } = data
      this.token = token
      if (this.refreshTi) clearTimeout(this.refreshTi)
      this.refreshTi = setTimeout(() => {
        this.auth()
      }, 1000 * 60 * 60 * 23)
    } catch (err) {
      console.log(err)
    }
  }
  async send({ info, msg, payload, cid, notify_id }) {
    try {
      let path = "push/single/cid"
      const body = {
        request_id: `${Date.now()}`,
        audience: {
          cid
        },
        push_channel: {
          ttl: -1
        },
        push_message: {
          notification: {
            notify_id,
            title: info.name,
            body: msg,
            logo_url: info.avatar,
            click_type: "payload",
            payload: JSON.stringify(payload)
          }
        }
      }
      await axios.post(`${this.baseUrl}/${path}`, body, {
        headers: { token: this.token }
      })
    } catch (err) {
      console.log(err)
      if (err === "token过期") {
        await this.auth()
        this.send()
      }
    }
  }
}

module.exports = new push()
