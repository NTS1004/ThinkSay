import axios from "@/utils/request/axios.js"
import { auth } from "../base-url.js"

export function funcGetAuthLogin(params) {
  return axios.get(`${auth}/login`, {
    params
  })
}

export function funcGetAuthRegister(params) {
  return axios.get(`${auth}/register`, {
    params
  })
}

export function funcGetAuthStatus(token) {
  return axios.get(`${auth}/status`, {
    headers: {
      "auth-token": token
    }
  })
}
