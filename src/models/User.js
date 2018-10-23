import Vuem from "../vuex-models";
import Api from "../api";
//
export default class User extends Vuem.Model {
	static schema = Vuem.Model.schema({
		id: Number,
		name: String,
		sector: {
			type: 'Combined',
			schema: {
				id: Number,
				name: { type: String, default: 'Default string' }
			}
		},
		message: {
			ref: 'Message',
		},
		messages: [{
			ref: 'Message',
		}]
	});

	static fetchOne(id) {
		return Api.getUser(id);
	}
}
