import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// d导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import '../src/assets/css/global.css'
// 导入树形表格
import TreeTable from 'vue-table-with-tree-grid'
// 导入axios包
import axios from 'axios'
// 配置接口基本地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截
axios.interceptors.request.use(config => {
//   console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 注册和使用树形组件
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
