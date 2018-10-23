import VuexModels from './vuexModels'

export let instance = new VuexModels();

export const plugin = (models) => {
		return (store) => {
			console.log('getting store');
			instance.init(store, models);
		};
	};

export default  {
	plugin,
	instance,
};
