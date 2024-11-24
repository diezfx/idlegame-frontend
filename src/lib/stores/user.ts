import { getContext, setContext } from 'svelte';

interface Userstore {
	userId: number;
	username: string;
	isLoggedIn: boolean;
}

function setUserContext(user: Userstore) {
	setContext('user', user);
}

function getUserFromContext(): Userstore | undefined {
	return getContext<Userstore>('user');
}

export { setUserContext, getUserFromContext };
