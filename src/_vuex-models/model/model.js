import Vuex from 'vuex';
import Vue from 'vue';
import {instance} from '../index';
import {warn} from "../util";
import ModelStore from '../modelStore';
import EventEmitter from 'event-emitter';

import _ from 'lodash';
import ArrayProxy from "../arrayProxy";

const sharedPropertyDefinition = {
	enumerable: true,
	configurable: true,
	get: () => {},
	set: () => {}
};

function proxy (target, sourceKey, key) {
	sharedPropertyDefinition.get = function proxyGetter () {
		return this[sourceKey][key]
	};
	sharedPropertyDefinition.set = function proxySetter (val) {
		// this[sourceKey][key] = val;
		target.updateField(key, val);
	};
	Object.defineProperty(target, key, sharedPropertyDefinition)
}

export default class Model {

	_populated = {};
	_resolver = null;
	$emitter = null;

	constructor() {
		this.$emitter = EventEmitter();
		this.instance = instance;
		this.manager = instance.manager;
		this._pending = false;

		if(this.constructor.name === Model.name) {
			throw Error('[vuex-models] This is abstract class');
		}

		if(!this.manager.has(this.constructor.name)) {
			this.manager.register(this.constructor.name, new ModelStore(this.constructor));
		}

		this.modelStore = this.manager.get(this.constructor.name);

		if(!this.modelStore.isInit) {
			this.init();
			this.modelStore.isInit = true;
		}
	}

	init() {
		throw Error('[vuex-models] Implements in the entity model');
	}

	_populate(...fields) {
		const tree = {};

		fields.forEach(field => {
			let split = field.split('.');

			let saved = '';
			split.forEach(v => {
				if(saved.length === 0) {
					saved = v;
				} else {
					saved += `.${v}`;
				}

				_.set(tree, saved, null);
			})
		});

		_.mapKeys(tree, (deep, field) => {
			const refField = this.schema[field][0] || this.schema[field];
			const refModelStore = this.manager.get(refField.ref);

			let populated = [];
			// if(_.isArray(this.schema[field])) {
			// 	populated = this._fields[field].map(pk => {
			// 		return refModelStore.getById(pk);
			// 	});
			// } else {
			// 	populated = refModelStore.getById(this._fields[field]);
			// 	// console.log(refField);
			// }

			//  let populateProxy = function (target, key, store) {
			// 	sharedPropertyDefinition.get = function proxyGetter () {
			// 		let messages = this._fields[key];
			// 		let proxy = new Proxy(this._fields[key], {
			// 			get: function(target, name) {
			// 				// console.log(name);
			// 				if(name === 'pending') {
			// 					return !target.map(v => store.getPendingObserver(v.id)).every(m => m.pending === false)
			// 				}
			//
			// 				if(name == 0 || name == 1) {
			// 					console.log('PROXY', store.getById(target[name]));
			// 					return store.getById(target[name]);
			// 				}
			//
			// 				return target[name];
			// 			},
			// 			has: function(target, name) {
			//
			// 				return true;
			// 				return !!target[name];
			// 			}
			// 		});
			//
			// 		console.log(proxy);
			//
			// 		return proxy;
			// 	};
			// 	sharedPropertyDefinition.set = function proxySetter (val) {
			// 		// this[sourceKey][key] = val;
			// 		// target.updateField(key, val);
			// 	};
			// 	Object.defineProperty(target, key, sharedPropertyDefinition)
			// };

			// console.log(populated);
			// populateProxy(this, field, refModelStore);

			let proxy = new Proxy(this._fields[field], {
				get: function(target, name) {
					// console.log(name);
					// if(name === 'pending') {
					// 	console.log('IS PENDING IN THE ARRAY');
					// 	console.log(
					// 		target.map(v => {
					// 			return refModelStore.getPendingObserver(v);
					// 		})
					// 	);
					// 	return !target.map(v => refModelStore.getPendingObserver(v)).every(m => m.pending === false)
					// }

					if(Number.isInteger(parseInt(name))) {
						console.log('PROXY', target[name]);
						return refModelStore.getById(target[name]);
					}

					return target[name];
				},
				has: function(target, name) {

					// return true;
					return !!target[name];
				}
			});

			this.instance.store.watch(() => this.instance.store.getters['Message/getById'](1), (o, n) => {
				console.log('WATCH: ', o, n);
			})

			Vue.set(this, 'messages_', proxy);
			// Vue.set(this, 'messages_', {
			// 	asd: 123
			// });

			// this._populated[field] = populated;

			// if(_.isObject(deep)) {
			// 	console.log(populated);
			// 	populated.forEach(m => {
			// 		// console.log(Object.keys(deep));
			// 		m.populate((Object.keys(deep))[0]);
			// 	})
			// }

			// proxy(this, '_populated', field);
		});
	}

	populate(...fields) {
		this._populate(...fields);

		return this;
	}

	get pending() {
		console.log('Pending: ', this.modelStore.getPendingObserver(this.id));
		return this.modelStore.getPendingObserver(this.id);
	}

	isPending(what = null) {
		// console.log(this._pending);
		return this._pending;
	}

	updateField(key, value) {
		this.modelStore.updateField(this.id, key, value);
	}

	set(fields, options = {}) {
		// this._fields = _.mapValues(fields, (value, key) => {
		//
		// 	// if(_.isArray(this.modelStore.schema[key])) {
		// 	// 	let v = this.modelStore.schema[key];
		// 	//
		// 	// 	return new ArrayProxy(value);
		// 	// }
		//
		// 	return value;
		// });

		// console.log(fields);
		this._fields = fields;

		// console.log(this._fields);

		Object.keys(this.modelStore.schema).forEach(v => {
			proxy(this, '_fields', v);
		})
	}

	get schema() {
		return this.modelStore.schema;
	};

	set schema(val) {
		this.modelStore.schema = val;
	}

	static getById(id) {
		let modelStore = instance.manager.get(this.name);
		// console.log(modelStore);
		const entity = modelStore.getById(id);
		// console.log(entity);

		return entity;
	}

	static compute(data) {
		console.log(this.name);
	}

	_get(filter) {
		let prefix = this.constructor.name;
		return this.instance.store.getters[`${prefix}/getById`](filter.id);
	}

}
