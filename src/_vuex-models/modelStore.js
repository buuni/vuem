import ProxyStore from "./proxyStore";
import {isPromise, createUid} from "./util";

export default class ModelStore {
	isInit = false;
	schema$ = null;
	cachedEntities = {};
	pendingEntities = {};

	constructor(model) {
		this.model = model;
		this.modelName = model.name;
		this.proxyStore = new ProxyStore(model);
	}

	updateField(id, key, val) {
		this.proxyStore.updateField(id, key, val);
	}

	getPendingObserver(id) {
		return this.proxyStore.getPendingObserver(id);
	}

	getById(id) {
		if(!this.cachedEntities[id]) {
			const data = this.proxyStore.getById(id);

			if(data === undefined || data === null) {
				let observerData = this.proxyStore.createEntityObserver(id);
				let entity = this.cachedEntity(id, observerData);

				this.proxyStore.fetchOne(id)
					.then(data => {
						console.log('AFTER FETCH');
						// entity.set(data, { triggerNotify: false });
						console.log(entity);
					});

				return entity;
			}

			return this.cachedEntity(id, data);
		}

		console.log('loaded from cache');

		return this.cachedEntities[id];
	}

	cachedEntity(id, data) {
		// console.log(this.model);
		const entity = new (this.model)();
		// entity.set({id: id}, { triggerNotify: false });
		entity.set(data, { triggerNotify: false });
		this.cachedEntities[id] = entity;

		return entity;
	}

	get schema() {
		return this.schema$;
	}

	set schema(val) {
		this.schema$ = val;
		this.proxyStore.updateSchema(val);
	}
}
