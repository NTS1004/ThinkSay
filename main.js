import Vue from 'vue'
import App from './App'
import store from './store/index.js'
import Toast from '@/utils/toast.js'
import Modal from '@/utils/modal.js'
import Moment from 'moment'
import '@/utils/backstage.js'

Vue.config.productionTip = false
Vue.prototype.$store = store
Vue.prototype.$Toast = Toast
Vue.prototype.$Modal = Modal
Vue.prototype.$moment = Moment

App.mpType = 'app'

// 引入全局uView
import uView from 'uview-ui'
Vue.use(uView);

const app = new Vue({
	...App
})
app.$mount()
