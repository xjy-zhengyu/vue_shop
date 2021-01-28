import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入样式
import './assets/css/global.css'
import axios from 'axios'
Vue.config.productionTip = false
// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$axios = axios
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
