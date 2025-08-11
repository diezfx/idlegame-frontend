import { getContext, setContext } from 'svelte';
import { writable } from 'svelte/store';

export interface Userstore {
	userId: number;
	username: string;
	isLoggedIn: boolean;
}

const defaultUser: Userstore = {
	userId: 0,
	username: '',
	isLoggedIn: false,
};

export const user = writable<Userstore>(defaultUser);

export function setUserContext(userData: Userstore) {
	user.set(userData);
	setContext('user', userData);
}

export function getUserFromContext(): Userstore | undefined {
	return getContext<Userstore>('user');
}
