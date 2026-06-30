import { writable } from 'svelte/store';

function createCO() {
	const {subscribe, set} = writable('');
	
	return {
		subscribe,
		set: (/** @type {string} */ value) => {
			set(value)
		},
		clear: () => {
			set('');
		}
	}
}

export const currentObject = createCO();