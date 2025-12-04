export interface User {
	userId: number;
	username: string;
	isLoggedIn: boolean;
}

const defaultUser: User = {
	userId: 1,
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
