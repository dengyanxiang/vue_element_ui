import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: Login },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect: '/welcome', children: [{ path: '/welcome', component: Welcome }, { path: '/users', component: User }, { path: '/rights', component: Rights }, { path: '/roles', component: Roles }, { path: '/categories', component: Cate }, { path: '/params', component: Params }, { path: '/goods', component: List }, { path: '/goods/add', component: Add }, { path: '/orders', component: Order }] }
]

const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
// to 代表要去的路由， from表示从哪来的路由，next表示要执行的路由
router.beforeEach((to, from, next) => {
  if (to.path === '/login') { // 如果是从登录页而来，则执行
    return next()
  } else { // 否则：判断token是否存在，如果不存在，则强制返回登录页，如果存在，则执行
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) {
      return next('/login')
    } else {
      next()
    }
  }
})

export default router
