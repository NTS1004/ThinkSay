const axios = require("axios")

axios.interceptors.response.use(
  (response) => {
    const { data, code } = response
    return data
  },
  (err) => {
    throw err
  }
)

module.exports = axios
