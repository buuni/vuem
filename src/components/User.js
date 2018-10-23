import {forEachValue} from "../util";
import Message from "./Message";
import _ from "lodash";

export default class User {
	constructor(store, target) {
		this.$store = store;
		this.$watchers = [];
		this.$pendings = {
			messages: false,
		};

		this.target = target;
	}

	get target() {
		return this.$target;
	}

	set target(target) {
		this.$target = target;

		forEachValue(target, (value, key) => {
			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get() {
					return this.$target[key];
				},
				set(value) {
					this.$store.commit('user/changeProperty', {
						id: this.id,
						property: key,
						value: value,
					});
				}
			})
		});

		const self = this;
		this.$messages = [];

		Object.defineProperty(this.$messages.__proto__, 'pending', {
			configurable: true,
			enumerable: true,
			get() {
				// console.log(self.$pendings.messages);
				return self.$pendings.messages;
			}
		})

		this.$watchers.forEach(unwatch => unwatch());
		this.$watchers = [];


		const unwatch = this.$store._watcherVM.$watch(
			() => this.$target.messages,
			function boundWatcher(val) {
				const merged = _.difference(val, self.$messages.map(m => m.id));

				console.log(val, self.$messages.map(m => m.id), merged);
				let pendingLength = merged.length;
				let pendingComplete = [];
				let watchers = [];

				self.$messages.push(...merged.map(id => {
					let rawMessage = self.$store.getters['messages/find'](id);
					let message = null;

					if(!rawMessage) {
						// fetch or find
						console.log('FETCH');
						message = Message.fetch(id, self.$store);
						self.$pendings.messages = true;
					} else {
						console.log('FIND');
						message = Message.find(id, self.$store);
					}

					if(message.$pending) {

						const unwatch = self.$store._watcherVM.$watch(
							() => {
								return self.$store.state['messages'].messages;
							},
							(current) => {
								console.log(id);
								// console.log(pendingLength, pendingComplete, current, old);
								let isPending = current[id] ? current[id].$pending : true;

								if(!isPending && !pendingComplete.includes(id)) {
									pendingComplete.push(id);
								}

								console.log('len', pendingLength);
								console.log('cur', pendingComplete.length);

								if(pendingComplete.length === pendingLength) {
									self.$pendings.messages = false;

									watchers.forEach(unwatch => {
										if(self.$watchers.includes(unwatch)) {
											self.$watchers.splice(self.$watchers.indexOf(unwatch, 1));
										}

										unwatch();
									});
								} else {
									self.$pendings.messages = true;
								}
							}
						);

						watchers.push(unwatch);
						self.$watchers.push(unwatch);
					}

					return message;
				})
				);
			},
			{
				immediate: true,
			}
		);

		this.$watchers.push(unwatch);
	}

	static find(id, store) {
		return new User(store, store.getters['user/find'](id));
	}

	static fetch(id, store) {
		const user = new User(store, {
			$pending: true,
			id: id,
			name: null,
			messages: [],
		});

		store.dispatch('user/fetch', id)
			.then(data => {
				user.target = store.getters['user/find'](id);
			});

		return user;
	}
}
