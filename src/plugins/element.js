import Vue from 'vue'
import { Button, Form, FormItem, Input, Message, container, header, aside, main, menu, submenu, MenuItem, breadcrumb, breadcrumbItem, card, option, Row, Col, Table, tableColumn, Switch, Tooltip, Pagination, Dialog, MessageBox } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(container)
Vue.use(header)
Vue.use(aside)
Vue.use(main)
Vue.use(menu)
Vue.use(submenu)
Vue.use(MenuItem)
Vue.use(breadcrumb)
Vue.use(breadcrumbItem)
Vue.use(card)
Vue.use(option)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(tableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
// Message代表弹窗，需要在VUE全局挂载进行注册
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
