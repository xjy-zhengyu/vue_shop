import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  redirect: '/login'
},
{
  path: '/login',
  name: 'Login',
  component: resolve => require(['@/components/Login.vue'], resolve)
},
{
  path: '/home',
  name: 'Home',
  component: resolve => require(['@/components/Home.vue'], resolve),
  redirect: '/welcome',
  children: [
    { path: '/welcome', component: resolve => require(['@/components/Welcome.vue'], resolve) },
    { path: '/users', component: resolve => require(['@/components/user/Users.vue'], resolve) },
    { path: '/rights', component: resolve => require(['@/components/power/Rights.vue'], resolve) },
    { path: '/roles', component: resolve => require(['@/components/power/Roles.vue'], resolve) },
    { path: '/categories', component: resolve => require(['@/components/goods/Cate.vue'], resolve) },
    { path: '/params', component: resolve => require(['@/components/goods/Params.vue'], resolve) },
    { path: '/goods', component: resolve => require(['@/components/goods/List.vue'], resolve) },
    { path: '/goods/add', component: resolve => require(['@/components/goods/Add.vue'], resolve) },
    { path: '/orders', component: resolve => require(['@/components/order/Order.vue'], resolve) }
  ]
}
]

const router = new VueRouter({
  routes
})

// 路由导航首位，控制访问页面权限
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 从哪个路径跳转来
  // next 是一个函数，next()表示放行。next('/login')强制跳转
  const tokenStr = window.sessionStorage.getItem('token')
  if (to.path === '/login') {
    return next()
  } else if (!tokenStr) {
    return next('/login')
  } else {
    next()
  }
})

export default router
