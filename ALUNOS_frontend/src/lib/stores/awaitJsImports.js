import { get, writable } from 'svelte/store';

function createAJSI() {
	const {subscribe, set} = writable(0);
	
	return {
		subscribe,
		set: (/** @type {number} */ value) => {
			set(value)
		},
		clear: () => {
			set(0);
		},
		add: () => {
			set(get(awaitJsImports) + 1)
		},
		addV: (/** @type {number} */ value) => {
			set(get(awaitJsImports) + value)
		},
		remove: () => {
			setTimeout(function(){
				set(get(awaitJsImports) - 1)
			}, 200)
		}
	}
}

export const awaitJsImports = createAJSI();