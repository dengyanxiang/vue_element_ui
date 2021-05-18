import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Message代表弹窗，需要在VUE全局挂载进行注册
Vue.prototype.$message = Message
