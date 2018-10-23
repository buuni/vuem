import Vue from 'vue';
import Model from "./model/model";

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

export default class ArrayProxy {
	_values = null;
	// _pending = true;

	constructor(values) {
		// console.log('Proxy: ', value);
		this.update(values)
	}

	update(values) {
		this._values = values;
		let resolve = [];
		Vue.set(this, '_pending', true);

		_.forEach(this._values, (value, i) => {
			if(value instanceof Model) {
				// console.log('is model: ', value);
				if(value.isPending()) {
					resolve.push(value._resolver);
				}
			}

			// console.log(123123123);

			proxy(this, '_values', i);
		});

		Promise.all(resolve).then(() => {
			Vue.set(this, '_pending', false);
		})

		return this;
	}

	isPending() {
		return this._pending;
	}

	map(fn) {
		return this._values.map(fn);
	}

	forEach(fn) {
		return this._values.forEach(fn);
	}

}
