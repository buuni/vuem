import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import User from './models/User';
import Message from './models/Message';
import Comment from './models/Comment';

import Vuem from "./vuex-models";
Vue.use(Vuem, store);

const models = Vuem.create({
  User, Message, Comment
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  models,
  render: h => h(App)
}).$mount('#app')
