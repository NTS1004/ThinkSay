import axios from "@/utils/request/axios.js"
import { info } from "../base-url.js"

export function funcPutInitInfo(params) {
  return axios.put(`${info}/init`, params)
}

export function funcPutMyInfo(params) {
  return axios.put(`${info}/edit`, params)
}
