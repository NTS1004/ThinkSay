import { pathToBase64 } from "image-tools"

const default_state = {
  cache_image: {}
}

let cache_image = uni.getStorageSync(`cache-image`) || {}
default_state.cache_image = cache_image

export default {
  namespaced: true,
  state: default_state,
  mutations: {
    async handlerCacheImage(state, cache_image_data) {
      const { cache_image } = state
      let isCache = false
      for (let i in cache_image_data) {
        let src = cache_image_data[i]
        if (src && src.includes("www.cjh1004.vip") && !cache_image[src]) {
          const [_, res] = await uni.getImageInfo({ src })
          const { path } = res
          let cache_path = await pathToBase64(path)
          cache_image[src] = cache_path
          isCache = true
        }
      }
      if (isCache) {
        state.cache_image = cache_image
        uni.setStorageSync(`cache-image`, cache_image)
      }
    }
  }
}
