import axios from "@/utils/request/axios.js"
import { record } from "../base-url.js"

export function funGetChatRecordList() {
  return axios.get(`${record}/chat/ID/list`)
}

export function funGetApplyRecordList() {
  return axios.get(`${record}/apply/ID/list`)
}
