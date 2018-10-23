import {forEachValue} from "../util";
import User from "./User";

export default class Message {
	constructor(store, target) {
		this.$store = store;
		this.$watchers = [];

		this.target = target;
	}

	get target() {
		return this.$target;
	}

	set target(target) {
		this.$target = target;

		forEachValue(target, (value, key) => {
			if(key === '$pending') {
				if(this.$pending !== undefined) {
					return;
				}
			}

			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get() {
					return this.$target[key];
				},
				set(value) {
					this.$store.commit('messages/changeProperty', {
						id: this.id,
						property: key,
						value: value,
					});
				}
			})
		});

		this.$watchers.forEach(unwatch => unwatch());
		this.$watchers = [];
	}

	static find(id, store) {
		return new Message(store, store.getters['messages/find'](id));
	}

	static fetch(id, store) {
		const message = new Message(store, {
			$pending: true,
			id: id,
			text: null,
		});


		if(!store.getters['messages/isFetching'](id)) {
			store.dispatch('messages/fetch', id)
				.then(data => {
					message.target = store.getters['messages/find'](id);
				});
		} else {
			console.log('IS FETCHING');
			const unwatch = store._watcherVM.$watch(() => store.getters['messages/fetching'], (n, o) => {
				if(!n.includes(id)) {
					message.target = store.getters['messages/find'](id);
					unwatch();
				}
			})

		}

		return message;
	}
}
