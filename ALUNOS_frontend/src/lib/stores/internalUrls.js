import { writable } from 'svelte/store';


function createInternalUrls() {
	const {subscribe, set, update} = writable({});
    
    return {
		subscribe,
		set,
		clear: () => {
			set({});
		}
	}
}

export const internalUrls = createInternalUrls();