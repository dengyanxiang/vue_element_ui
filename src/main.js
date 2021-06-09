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
// 富文本编辑器的导入
import VueQuillEditor from 'vue-quill-editor'
// 富文本编辑器的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
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
// 全局注册富文本编辑器
Vue.use(VueQuillEditor)
// 注册时间过滤器处理函数: dateFormat为过滤器名称
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // PadStart(2, '0'): 表示对获取的月份不足两位就用0补齐，2表示两位数，0表示需要补全的数
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  // 时间格式："yyyy-mm-dd hh:mm:ss"
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
