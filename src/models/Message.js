import Api from "../api";
import Vuem from "../vuex-models";

export default class Message extends Vuem.Model {
	static schema = Vuem.Model.schema({
		id: Number,
		text: {type: 'String'},
		comments: [{ref: 'Comment'}]
	});

	static fetchOne(id) {
		return Api.getMessage(id);
	}
}
