import Api from "../api";
import Vuem from "../vuex-models";

export default class Asset extends Vuem.Model {
	static schema = {
		id: Number,
		name: String,
		alias: String,
		sector: {
			ref: 'Sector'
		},
		sectors: [{
			ref: 'Sector'
		}],
		criteria: [{
			type: 'combined',
			schema: {
				popularity: Number,
				criterion: { ref: 'Criterion' }
			}
		}]
	};

	static fetchOne(id) {
		return Api.getSector(id);
	}
}
