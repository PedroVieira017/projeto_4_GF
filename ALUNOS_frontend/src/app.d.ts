// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	declare module "*.json"
	namespace App {
		// interface Error {}
		interface Locals {
			info_utili: any
		}
		//interface PageData {}
		// interface Platform {}
	}
}

export {};
