import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
// import Mock from './mock'
// import axios from './axios'

Vue.config.productionTip = false;
Vue.use(ElementUI);

let vue = new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});

export default vue;
