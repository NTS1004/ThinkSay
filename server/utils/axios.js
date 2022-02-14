const axios = require("axios")

axios.interceptors.response.use(
  (response) => {
    const { data, code } = response
    if ([10001].includes(code)) {
      throw "token过期"
    } else {
      return data
    }
  },
  (err) => {
    throw err
  }
)

module.exports = axios
