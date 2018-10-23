import Manager from './manager';

export default class VuexModels {
	constructor() {
		this.store = null;
		this.isInit = false;

		this.manager = new Manager(this);
	}

	init(store, models) {
		this.store = store;

		models.forEach(m => {
			this.registerModel(m);
		});

		this.isInit = true;
	}

	registerModel(model) {
		// Todo fix it
		new model();
	}
}
