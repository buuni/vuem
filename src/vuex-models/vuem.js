import Vue from 'vue';
import {forEachValue} from "./util";
import Model from "./model";
import api from "../api";
import Message from "../components/Message";

export class Vuem {
	constructor(models) {
		// Todo fix it;
		// Model.__vuem = this;

		this.models = models;
		this.$store = null;

		const vuemSelf = this;

		// Init cached collection
		const collection = {};
		const interfaces = {};
		forEachValue(models, (value, key) => {
			// Add Vuem instance to the proto
			value.__vuem = this;

			function localParams() {
				return {
					store: vuemSelf.store,
					localStore: vuemSelf.store._modulesNamespaceMap[`${key}/`],
					model: vuemSelf.$models[key],
					interfaces: vuemSelf.$interfaces[key]
				}
			}

			collection[key] = {};
			interfaces[key] = {
				findById: function boundFindById(id) {
					return findById.call(vuemSelf, localParams(), id);
				},
				$fetchOne: function boundFetchOne(id) {
					return fetchOne.call(vuemSelf, localParams(), id);
				},
				createEntity: function boundCreateEntity(data) {
					return createEntity.call(vuemSelf, localParams(), data);
				},
				create: function boundCreate(data) {
					return create.call(vuemSelf, localParams(), data);
				},
			}
		});

		// Отключаем ошибки
		const silent = Vue.config.silent;
		Vue.config.silent = true;
		this._vm = new Vue({
			data: {
				$$models: models,
				$$collection: collection,
				$$interfaces: interfaces,
			}
		});
		Vue.config.silent = silent;

		forEachValue(models, (value, key) => {
			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get: function wrappedGetter() {
					return vuemSelf.$interfaces[key];
				},
				set: function wrappedSetter() {
					console.log('[vuem] You don`t change this Model in the setter method. Use Vuem.register() to bound model');
				}
			})
		})
	}

	$registerVuexModule({interfaces}, module) {
		const self = this;
		let raw = {
			namespaced: true,
			state: {
				entities: {},
				fetching: [],
			},

			getters: {
				find: state => id => {
					return state.entities[id];
				},
				isFetching: state => id => {
					return state.fetching.includes(id);
				}
			},

			actions: {
				async fetch({commit, dispatch}, id) {
					commit('fetching', {id: id, status: true});
					const raw = await interfaces.$fetchOne(id);
					commit('create', {id: id, data: {
						$pending: false,
						...raw
					}});
					commit('fetching', {id: id, status: false});
				}
			},
			mutations: {
				changeProperty(state, {id, property, value}) {
					state.entities[id][property] = value;
				},
				pushToArray(state, {id, property, value}) {
					state.entities[id][property].push(...value);
				},
				create(state, {id, data}) {
					Vue.set(state.entities, id, data);
				},
				fetching(state, {id, status}) {
					if(status && !state.fetching.includes(id)) {
						state.fetching.push(id);
					} else if(!status && state.fetching.includes(id)) {
						state.fetching.splice(state.fetching.indexOf(id), 1);
					}
				}
			}
		};

		this.store.registerModule(module, raw);
	}

	watch(what, fn, options) {
		return this._vm.$watch(what, fn, options);
	}

	get $models() {
		return this._vm._data.$$models;
	}

	get $collection() {
		return this._vm._data.$$collection;
	}

	get $interfaces() {
		return this._vm._data.$$interfaces;
	}

	get store() {
		return this.$store;
	}

	set store(val) {
		this.$store = val;

		forEachValue(this.$interfaces, (value, key) => {
			this.$registerVuexModule({interfaces: value}, key);
		})
	}
}

function findById({store, localStore, model, interfaces}, id) {
	// console.log(localStore.context.getters);
	// console.log(id);
	if(this.$collection[model.name][id]) {
		return this.$collection[model.name][id];
	}

	let entity;
	if(localStore.context.getters['find'](id)) {
		entity = (new model(localStore.context.getters['find'](id)));
	} else {
		entity = interfaces.createEntity({id: id});
	}

	this.$collection[model.name][id] = entity;

	return entity;
}

function fetchOne({store, localStore, model, interfaces}, id) {
	return model.fetchOne(id);
}

function createEntity({store, localStore, model, interfaces}, data) {
	data = {
		...model.schema.getDefaultSchema(),
		...data,
	};


	data['$pending'] = true;
	data['$model'] = model.name;

	const id = data.id;
	const entity = (new model(data));

	if(!localStore.context.getters['isFetching'](id)) {
		// console.log('IS FIND');
		localStore.context.dispatch('fetch', id)
			.then(data => {
				entity.$target = localStore.context.getters['find'](id);
			});
	} else {
		// console.log('IS FETCHING');
		const unwatch = this.watch(() => localStore.context.getters['fetching'], (n, o) => {
			if(!n.includes(id)) {
				entity.$target = localStore.context.getters['find'](id);
				unwatch();
			}
		})
	}

	return entity;
}

function create({store, localStore, model, interfaces}, data) {
	data = {
		...model.schema.getDefaultSchema(),
		...data,
	};

	data['$pending'] = false;
	data['$model'] = model.name;

	const id = data.id;

	console.log(localStore);

	localStore.context.commit(`create`, {
		id,
		data,
	});

	const entity = (new model(localStore.context.getters['find'](id)));

	return entity;
}

export function instance(models = {}) {
	return new Vuem(models);
}
