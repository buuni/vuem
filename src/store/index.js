import Vue from 'vue'
import Vuex from 'vuex'
import base from './modules/base'
import user from './modules/user'
import messages from './modules/messages'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    base,
    user,
	  messages
  },
  strict: debug,
})
