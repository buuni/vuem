import Vue from 'vue';
import Schema from './schema';
import {forEachValue} from './util';
import Message from "../components/Message";
import _ from "lodash";
import {commit} from "./store";

export default class Model {
	constructor(target) {
		this.$watchers = [];
		this.$pendings = {};
		this._loadedRefs = [];

		this.__target = null;
		this.$target = target;

		this.commit = commit(this);
	}

	get $target() {
		return this.__target;
	}

	set $target(target) {
		// console.log('Target:', target);
		const self = this;
		this.__target = target;

		forEachValue(target, (value, key) => {
			// if(['$model', '$pending'].includes(key)) {
			// 	return;
			// }

			// let test = null;
			// if(Array.isArray(value)) {
			// 	// test =
			// 	this.$target[key].push = function boundPush(...val) {
			// 		self.commit('pushToArray', {
			// 			id: self.id,
			// 			property: key,
			// 			value: val,
			// 		});
			// 	}
			// }



			if(Array.isArray(value)) {
				let copy = _.clone(value);

				// console.log(value.__ob__);
				copy.push = (...val) => {
					console.log('COPY PUSH', val);
					self.commit('pushToArray', {
						id: self.id,
						property: key,
						value: val,
					});
					// value.__ob__.notify();
				};

				Object.defineProperty(this, key, {
					enumerable: true,
					configurable: true,
					get() {
						console.log(copy);
						return copy;
					},
					set(val) {
						copy.push(val);
						console.log(val);

					}
				});
				return;
			}

			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get() {
					// if(key === 'messages') {
					// 	let arrayChangeHandler = {
					// 		get: function(target, property) {
					// 			console.log('getting ' + property + ' for ' + target);
					// 			// property is index in this case
					// 			return target[property];
					// 		},
					// 		set: function(target, property, value, receiver) {
					// 			console.log('setting ' + property + ' for ' + target + ' with value ' + value + ' in ', receiver);
					//
					// 			if(property == 0) {
					// 				self.commit('pushToArray', {
					// 					id: self.id,
					// 					property: key,
					// 					value: [value],
					// 				});
					//
					// 				return true;
					// 			}
					//
					// 			if(property === 'length') {
					// 				console.log(property);
					// 				return true;
					// 			}
					// 			target[property] = value;
					// 			// you have to return true to accept the changes
					// 			return true;
					// 		}
					// 	};
					// 	let proxyToArray = new Proxy(this.$target[key], arrayChangeHandler);
					//
					// 	return proxyToArray;
					// }
					return this.$target[key];
				},
				set(value) {
					// console.log(value);
					// if(key === '$pending') return;

					this.commit('changeProperty', {
						id: this.id,
						property: key,
						value: value,
					});
				}
			})
		});

		if(this._loadedRefs.length) {

			this.$watchers.forEach(unwatch => unwatch());
			this.$watchers = [];

			this.witch(...this._loadedRefs);
		}
	}

	witch(...refs) {
		if(refs.length === 0) return this;
		// console.log(refs);
		const tree = {};

		refs.forEach(ref => {
			if(!this._loadedRefs.includes(ref)) {
				this._loadedRefs.push(ref);
			}

			// console.log('Ref', ref.split);
			let split = ref.split('.');

			let saved = '';
			split.forEach(v => {
					saved = saved.length === 0 ? v : `${saved}.${v}`;
					_.set(tree, saved, null);
			});
		});

		const self = this;

		forEachValue(tree, (deep, key) => {
			let refSchema = this.$schema.get(key);

			if(refSchema.type === 'ArrayReference' || refSchema.type === 'Reference') {
				// console.log(refSchema);

				this._bindWatcherToRef(key, refSchema.ref, deep);
			}
		});

		return this;
	}

	_bindWatcherToRef(refName, ref, deep = null) {
		// console.log('Deep: ', deep);
		if(deep !== null && deep !== undefined) {
			deep = rollup(deep);
		} else {
			deep = [];
		}
		// console.log('Result', deep);


		const objKey = `\$${refName}`;

		this[objKey] = [];
		this.$pendings[refName] = false;

		// console.log(refName, ref);

		Object.defineProperty(this[objKey].__proto__, 'pending', {
			configurable: true,
			enumerable: true,
			get() {
				return self.$pendings[refName];
			}
		});

		let push = (...val) => {
			const ids = [];

			val.forEach(e => {
				let id = e;

				if(e.constructor.name === ref) {
					id = e.id;
				} else if(typeof e === 'object') {
					// TODO ...
					let model = self.$vuem.$interfaces[ref].create(e);
					id = model.id;
				}

				ids.push(id);
			});

			self.commit('pushToArray', {
				id: self.id,
				property: refName,
				value: ids,
			});
		}

		this[objKey].push = push;

		const self = this;

		const unwatch = this.$watch(
			() => this.$target[refName],
			function boundWatcher(val) {
				// console.log(val);
				// TOdo
				// if(val === undefined) return;
				// const merged = _.difference(val, self.$messages.map(m => m.id));
				// console.log(self.$target.messages);
				// console.log(val, self.$messages.map(m => m.id), merged);
				// console.log(val);
				// console.log(val);
				let pendingLength = val.length;
				let pendingComplete = [];
				let watchers = [];

				self[objKey] = val.map(id => {
					// self[refName].push(id);
					let rawMessage = self.$vuem.$store.getters[`${ref}/find`](id);
					let entity = self.$vuem.$interfaces[ref].findById(id);
					// console.log(entity);

					if(self.constructor.name === 'Message') {
						console.log(refName, entity.$pending);
					}

					if(!rawMessage) {
						// fetch or find
						// console.log('FETCH');
						self.$pendings[refName] = true;
					}

					if(entity.$pending) {
						const unwatch = self.$watch(
							() => {
								return self.$vuem.$store.state[ref].entities;
							},
							function boundWatcher (current) {
								// console.log(id);
								// console.log(pendingLength, pendingComplete, current, old);
								let isPending = current[id] ? current[id].$pending : true;

								if(!isPending && !pendingComplete.includes(id)) {
									pendingComplete.push(id);
								}

								// console.log('len', pendingLength);
								// console.log('cur', pendingComplete.length);

								if(pendingComplete.length === pendingLength) {
									self.$pendings[refName] = false;

									watchers.forEach(unwatch => {
										if(self.$watchers.includes(unwatch)) {
											self.$watchers.splice(self.$watchers.indexOf(unwatch, 1));
										}

										unwatch();
									});
								} else {
									self.$pendings[refName] = true;
								}
							}
						);

						watchers.push(unwatch);
						self.$watchers.push(unwatch);
					}
					// console.log(deep);
					return entity.witch(...deep);
				});

				self[objKey].push = push;
			},
			{
				immediate: true,
			}
		);

		this.$watchers.push(unwatch);
	}

	$watch(what, fn, options = {}) {
		return this.$vuem.watch(what, fn, options);
	}

	get $vuem() {
		return this.constructor.__vuem;
	}

	get $schema() {
		return this.constructor.schema;
	}

	static schema(schema) {
		return new Schema(schema, this.name);
	}

	static create(object) {
		// this.__vuem.
		// Todo...
		// console.log(this.__vuem);
	}
}

function rollup(tree, prefix = null) {
	let result = [];

	forEachValue(tree, (value, key) => {
		result.push(prefix ? `${prefix}.${key}` : key);
		if(value) {
			result.push(...rollup(value, key))
		}
	});

	return result;
}
