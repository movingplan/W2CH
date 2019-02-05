
import { RepositoryFactory } from 'public/todoitems/repository/repositoryfactory.js'
import { local } from 'wix-storage';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';
export class MainService {
	constructor(days) {
		if (!days) {
			throw new Error("Days param were not provided....")
		}
		this.days = days;
		this.repository = RepositoryFactory.get(days);
		this.key = `tasks_${days.days}_${days.days_after_move}`;
		return this;
	}
	static async getMoveDate() {
		try {
			let ms = new MainService({ days: 90, days_after_move: 0 });
			let user = wixUsers.currentUser;
			let email = await user.getEmail();
			if (email) {
				return await ms.repository.getMoveDate(email);
			}
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
	}

	static async setMoveDate(moveDate) {
		try {
			let ms = new MainService({ days: 90, days_after_move: 0 });
			let user = wixUsers.currentUser;
			let email = await user.getEmail();
			if (email) {
				return await ms.repository.setMoveDate({ email, moveDate });
			}
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}

	}
	async get() {
		try {
			let user, email;
			try {
				user = wixUsers.currentUser;
				email = await user.getEmail();
			} catch (err) {
				console.log(`user err ${{ email }} ${err.stack}`);
			}
			return await this.repository.get(email);
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}

	}

	async save(toSave) {

		let loggedin = wixUsers.currentUser.loggedIn;
		let { tasks } = toSave;
		if (loggedin) {
			try {
				let user = wixUsers.currentUser;
				let email = await user.getEmail();
				if (email) {
					let key = this.key;
					let toInsert = { 'tasks': tasks, 'email': email, 'key': key };
					return await this.repository.save(toInsert);
				}
			} catch (err) { }

		} else {
			console.log(`user not logged in`);
			return await this.repository.save(tasks);
		}
	}


	static async approveUser(query) {
		let ms = new MainService({ days: 90, days_after_move: 0 });
		let userForApproval;
		if (query.token) {
			userForApproval = await ms.repository.getUserForApproval({ token: query.token, registrationConfirmation: false });
			let { items } = userForApproval;
			if (items.length === 1) {
				userForApproval = items[0];
				userForApproval.registrationConfirmation = true;
				return await ms.repository.approveUser(userForApproval);
			}
		}
	}

	async getLocalTasks(email) {
		let getcheckListFromLocal = async () => {
			let res = await this.repository.getAllPredefinedTasks();
			if (res.items.length > 0) {
				let keys = new Set(res.items.map(item => `tasks_${item.days}_${item.days_after_move}`));
				let arr = [...keys];
				let toSave = arr.map(key => {
					return {
						email,
						key,
						tasks: JSON.parse(local.getItem(key))
					}
				})
				return await toSave.filter(item => item.tasks !== null);
			}
		}
		if (!email) {
			throw new Error("Email was not defined");
		}
		let items = await getcheckListFromLocal();
		if (items.length > 0) {
			return await items;
		}

	}

	async registerForApprovalAndTransfer() {
		let registered = false;
		let exists = false;
		let loggedIn;
		try {
			let user = wixUsers.currentUser;
			let email = await user.getEmail();

			//1. whether it exists already in AccountConfirmation
			exists = await this.repository.accountConfirmationExists({ 'token': user.id, 'email': email });
			if (exists === false) {
				let toSave = await this.getLocalTasks(email);
				let approve = await this.repository.registerForApproval({ 'token': user.id, 'email': email });
				let res = await this.repository.transfer(toSave, email);
				registered = true;
			}

			//return await this.repositoryLocal.clearAll();
		} catch (e) {
			console.log(`error in register approval and transfer = > an err was issued ${e.message} ${e.stack}`);
		}
		return registered;
	}

}