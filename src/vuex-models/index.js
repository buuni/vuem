import {Vuem, instance} from './vuem';
import Model from './model';

function install(Vue, store) {
	const version = Number(Vue.version.split('.')[0]);

	Vue.mixin({ beforeCreate: vuemInit });
	function vuemInit() {
		// console.log(store);

		console.log('[Vuem] Inject', this);
		const options = this.$options;
		// console.log(options);
		// vuem injection
		if (options.models) {
			this.$models = typeof options.models === 'function'
				? options.models()
				: options.models
		} else if (options.parent && options.parent.$models) {
			this.$models = options.parent.$models
		}

		if(this.$models && !this.$models.store) {
			this.$models.store = store;
		}
	}
}


export default {
	Vuem,
	create: instance,
	install,
	Model,
}
