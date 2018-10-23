import Vue from 'vue';
import {instance} from "./index";

export default class ProxyStore {
	model = null;

	constructor(model) {
		this.model = model;
		this.store = instance.store;
		this.moduleName = model.name;

		if(!ProxyStore.moduleHasRegister(this.moduleName)) {
			this.registerModule(this.moduleName);
		}

		this.vuexModule = ProxyStore.getVuexModule(this.moduleName);
	}

	getPendingObserver(id) {
		let observe = this.getters('pending', id);
		if(observe === undefined) {
			this.dispatch('startPending', id);
		}

		return observe || this.getters('pending', id);
	}

	createEntityObserver(id, data = null) {
		this.dispatch('pushEntity', {
			id: id,
			data: {
				id: id,
				name: '',
				messages: []
			}
		});

		return this.getters('getById', id);
	}

	getters(name, data) {
		return (this.vuexModule.context.getters[name])(data);
	}

	commit(name, data, options) {
		this.vuexModule.context.commit(name, data, options);
	}

	dispatch(name, data) {
		return this.vuexModule.context.dispatch(name, data);
	}


	updateField(id, key, value) {
		this.commit('__updateKeyValue', {
			id: id,
			key: key,
			value: value,
		});
	}

	updateSchema(schema) {
		const raw = this.vuexModule._rawModule;

		Object.keys(schema).forEach(v => {
			this.commit('__addSchemaField', {field: v, value: null});
		});

	}

	getById(id) {
		return this.getters('getById', id);
		// return this.store.getters[`${this.moduleName}/getById`](id);
	}

	fetchOne(id) {
		return this.dispatch('fetchOneEntity', id);
	}

	create(data) {
		this.commit('__createEntity', data);
	}

	static moduleHasRegister(module) {
		return !!instance.store._modulesNamespaceMap[`${module}/`];
	}

	static getVuexModule(module) {
		return instance.store._modulesNamespaceMap[`${module}/`];
	}

	registerModule(module) {
		instance.store.registerModule(module, this.createModule(module))
	}

	createModule(module) {
		let entities = {};
		if(module === 'User') {
			entities = {
				1: {
					id: 1,
					name: 'Igor',
					messages: [2, 3]
				},
				2: {
					id: 2,
					name: 'John',
					messages: [1, 3]
				},
				3: {
					id: 3,
					name: 'Dima',
					messages: [1, 2]
				}
			}
		} else {
			entities = {
				1: {
					id: 1,
					text: 'Message 1',
					to: 1,
				},
				2: {
					id: 2,
					text: 'Message 2',
					to: 2,
				},
				3: {
					id: 3,
					text: 'Message 3',
					to: 3,
				},
			}
		}

		const context = this;

		return {
			namespaced: true,
			state: {
				entities: {},
				pending: {}
			},
			getters: {
				getById: state => id => {
					return state.entities[id];
				},
				pending: state => id => {
					return state.pending[id];
				}
			}
			,
			actions: {
				update(){},
				async fetchOneEntity({commit, dispatch}, id) {
					dispatch('startPending', id);
					return context.model.fetchOne(id).then((data) => {
						console.log('LOADED');
						dispatch('pushEntity', data);
						dispatch('endPending', id);
						return data;
					});
				},

				pushEntity({commit, dispatch, getters}, data) {
					if(!getters['getById'](data.id)) {
						console.log('CREATE');
						commit('__createEntity', data);
					} else {
						console.log('UPDATE');
						commit('__updateEntity', {id: data.id, data: data});
					}
				},

				startPending({commit}, id) {
					commit('updatePending', {id: id, status: true});
				},

				endPending({commit}, id) {
					commit('updatePending', {id: id, status: false});
				}
			},
			mutations: {
				updatePending(state, {id, status}) {
					state.pending[id] = status;
				},
				__addSchemaField(state, {field, value}) {
					Vue.set(state, field, value)
				},
				__updateKeyValue(state, {id, key, value}) {
					Vue.set(state.entities[id], key, value);
				},

				__updateEntity(state, {id, data}) {
					_.forEach(data, (v, k) => {
						state.entities[id][k] = v;
					})
					// Vue.set(state.entities, id, data);
				},
				__createEntity(state, {id, data}) {
					Vue.set(state.entities, data.id, data);
				}
			}
		}
	}

}
