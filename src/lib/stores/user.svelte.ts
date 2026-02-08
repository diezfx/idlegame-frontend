export interface User {
	userId: string;
	username: string;
	isLoggedIn: boolean;
}

const defaultUser: User = {
	userId: '00000000-0000-0000-0000-000000000001',
	username: 'test',
	isLoggedIn: true,
};

class UserStore {
	//TODO: add actual user data from somewhere
	user = $state(defaultUser);

	getUser(): User {
		return this.user;
	}
}

export const userStore = new UserStore();
