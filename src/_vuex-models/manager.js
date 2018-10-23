export default class Manager {

	constructor(instance) {
		this.collection = {};
		this.instance = instance;
	}

	push(modelStore) {
		this.collection[modelStore.modelName] = modelStore;
	}

	get(modelName) {
		return this.collection[modelName];
	}

	has(modelName) {
		return !!this.collection[modelName];
	}

	register(name, store) {
		this.collection[name] = store
	}

}
