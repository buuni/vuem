import {forEachValue} from "../util";

export default class Schema {
	constructor(schema, model) {
		this.model = model;
		this.rawSchema = schema;

		this.schema = normalizeSchema(schema);

		console.log(this.schema);
	}

	get(property) {
		return this.schema[property];
	}

	getDefaultSchema() {
		const schema = {};
		forEachValue(this.schema, (value, key) => {
			if(value.type === 'ArrayReference') {
				schema[key] = [];
				return;
			}

			schema[key] = value.default;
		});

		return schema;
	}
}

const reservedKeys = ['$id', '$pending'];
const basicTypes = ['Number', 'String', 'Boolean', 'Reference', 'Combined', 'ArrayReference', 'Array'];

function normalizeSchema(schema) {
	const prepared = {};

	forEachValue(schema, (value, key) => {
		if(reservedKeys.includes(key)) {
			console.warn(`[Vuem] You can use reserved value. Please, choose alias for '${key}' key`);
			return;
		}

		prepared[key] = prepareAttr(value);
	});

	return prepared;
}

function prepareAttr(value) {
	let attr = {
		type: null,
		default: null,
		required: null,
		ref: null,
		schema: null,
	};

	if(typeof value === 'function') {
		if(basicTypes.includes(value.name)) {
			attr.type = value.name;
			attr.default = value();
		} else {
			console.warn(`[Vuem] Unresolved type '${value.name}'`);
			return null;
		}
	}

	if(Array.isArray(value) && value[0] && typeof value[0] === 'object') {
		attr.type = 'ArrayReference';
		attr.ref = value[0].ref;
		return attr;
	} else if (Array.isArray(value)) {
		attr.type = 'Array';
		attr.default = [];
		return attr;
	}

	if(typeof value === 'object') {
		if(value.type) {
			let typeName = typeof value.type === 'function' ? value.type.name : value.type;

			if(basicTypes.includes(typeName)) {
				attr.type = typeName;
			} else {
				console.warn(`[Vuem] Unresolved type '${value.name}'`);
				return null;
			}
		}

		if(value.default !== undefined) {
			attr.default = value.default;
		}

		if(value.ref !== undefined) {
			console.log(value);
			attr.type = 'Reference';
			attr.ref = value.ref;
		}

		// console.log('asdasda', typeof value.schema);

		if(typeof value.schema === 'object') {
			attr.type = 'Combined';
			attr.schema = normalizeSchema(value.schema);
		}
	}

	return attr;
}
