import Api from "../api";
import Vuem from "../vuex-models";

export default class Comment extends Vuem.Model {
	static schema = Vuem.Model.schema({
		id: Number,
		comment: String,
	});

	static fetchOne(id) {
		return Api.getComment(id);
	}
}
