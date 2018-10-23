import _ from 'lodash';
import api from "../../api";
import Vue from 'vue';

const state = {
  fetching: [],
  messages: {
    1: {
      $pending: false,
      id: 1,
      text: 'Message 1',
    },
	  2: {
		  $pending: false,
		  id: 2,
		  text: 'Message 2',
	  }
  }
};

// getters
const getters = {
  find: (state) => (id) => state.messages[id],
  filter: (state) => (filter) => _.filter(state.messages, filter),
  isFetching: (state) => id => state.fetching.includes(id),
  fetching: (state) => state.fetching
};

// actions
const actions = {
	async fetch({commit, dispatch}, id) {
		commit('fetching', {id: id, status: true});
		const message = await api.getMessage(id);
		commit('create', {id: id, data: message});
		commit('fetching', {id: id, status: false});
	}
};

// mutations
const mutations = {
	changeProperty(state, {id, property, value}) {
    state.messages[id][property] = value;
  },
	create(state, {id, data}) {
		Vue.set(state.messages, id, data);
	},
  fetching(state, {id, status}) {
	  if(status && !state.fetching.includes(id)) {
	    state.fetching.push(id);
    } else if(!status && state.fetching.includes(id)) {
	    state.fetching.splice(state.fetching.indexOf(id), 1);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
