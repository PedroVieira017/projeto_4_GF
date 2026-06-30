import { writable } from 'svelte/store';

function createCM() {
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

export const currentModule = createCM();