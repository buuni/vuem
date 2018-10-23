export function sleep(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

export function forEachValue (obj, fn) {
	Object.keys(obj).forEach(key => fn(obj[key], key))
}
