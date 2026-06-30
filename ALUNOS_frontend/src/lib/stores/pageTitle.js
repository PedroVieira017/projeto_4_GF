import { writable } from 'svelte/store';

function createTitle() {
	const {subscribe, set, update} = writable('ON.IPVC v3');
	
	return {
		subscribe,
		set: (/** @type {string} */ value) => {
			set(`${value} • ON.IPVC v3`)
		},
		clear: () => {
			set('ON.IPVC v3');
		}
	}
}

export const title = createTitle();