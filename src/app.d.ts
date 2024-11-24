// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Userstore } from '$lib/stores/user';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: Userstore;
		}
		interface PageData {
			user: Userstore;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
