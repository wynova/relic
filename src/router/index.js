import Vue from 'vue'
import Router from 'vue-router'
import Login from '../pages/login'

Vue.use(Router)
let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    }
  ]
});

export default router