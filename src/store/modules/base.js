const state = {
  messages: {},
  test: null,
  value: {
    1: {
	    id: 1,
	    name: 'Igor',
	    pending: true,
      deepObject: {
	      deepObject: {
	        foo: {
	          bar: [],
          }
        }
      }
    }
  },
  deeps: {
    1: []
  }
};

// getters
const getters = {
  messages: (state) => state.messages,
  value: (state) => (id) => state.value[id],
  deeps: (state) => (id) => state.deeps[id]
};

// actions
const actions = {
  test({commit}, data) {
    commit('test', data);
  }

};

// mutations
const mutations = {
  test(state, data) {
    state.test = data;
  },
  addToDeeps(state, {id, value}) {
    state.deeps[id].push(value);
  },
  addToDeepObjectInTheValue(state, {id, value}) {
    state.value[id].deepObject.deepObject.foo.bar.push(value);
  },
  changeValue(state, {id, value}) {
    state.value[id].name = value;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
