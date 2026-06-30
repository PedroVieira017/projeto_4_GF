import { writable } from 'svelte/store';

function createCM() {
	const {subscribe, set} = writable(0);
	
	return {
		subscribe,
		set: (/** @type {number} */ value) => {
			set(value)
		},
		clear: () => {
			set(0);
		}
	}
}

export const currentObjectId = createCM();