import api from "../../api";
import Vue from "vue";

const state = {
  users: {
    1: {
      $pending: false,
      id: 1,
      name: 'Igor',
      messages: [1, 4]
    }
  }
};

// getters
const getters = {
  find: (state) => (id) => state.users[id],
};

// actions
const actions = {
  async fetch({commit, dispatch}, id) {
    const user = await api.getUser(id);
    commit('create', {id: id, data: user});
  }
};

// mutations
const mutations = {
	changeProperty(state, {id, property, value}) {
    state.users[id][property] = value;
  },
	pushToProperty(state, {id, property, value}) {
		state.users[id][property].push(value);
	},
  create(state, {id, data}) {
	  Vue.set(state.users, id, data);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
