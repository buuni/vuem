import {sleep} from "./util";


const users = {
	1: {

		id: 1,
		name: 'Igor Demko',
		messages: [1, 2]
	},
	2: {

		id: 2,
		name: 'Dmitry Portnyagin',
		messages: [1, 4]
	},
	3: {

		id: 3,
		name: 'Sergey Zacharov',
		messages: [5, 6]
	}
};

const messages = {
	1: {

		id: 1,
		text: 'Message text 1',
		comments: [1],
	},
	2: {

		id: 2,
		text: 'Message text 2',
		comments: [2],
	},
	3: {

		id: 3,
		text: 'Message text 3',
		comments: [1, 2],
	},
	4: {

		id: 4,
		text: 'Message text 4',
		comments: [1, 2],
	},
	5: {

		id: 5,
		text: 'Message text 5',
		to: 1
	},
	6: {

		id: 6,
		text: 'Message text 6',
		to: 2
	},
};

const comments = {
	1: {
		id: 1,
		comment: 'New comment 1'
	},
	2: {
		id: 2,
		comment: 'New comment 2'
	},
};

const sectors = {
	1: {
		id: 1,
		title: 'Blockchain'
	},
	2: {
		id: 2,
		title: 'Financial'
	}
};

let count = 0;

export class Api {
	async getUser(id) {
		await sleep(1000);

		return users[id];
	}

	async getMessage(id) {
		await sleep(1000 * count++);

		return messages[id];
	}

	async getComment(id) {
		await sleep(3000);

		return comments[id];
	}

	async getSector(id) {
		return sectors[id];
	}
}

export default new Api();
