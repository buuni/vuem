export default function commit(model) {
	return (mutationName, data) => {
		return model.$vuem.$store.commit(`${model.constructor.name}/${mutationName}`, data);
	}
}
