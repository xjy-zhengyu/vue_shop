import Vue from 'vue'
// 按需导入，需要导入什么，就添加
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 挂在弹框组件
Vue.prototype.$message = Message
