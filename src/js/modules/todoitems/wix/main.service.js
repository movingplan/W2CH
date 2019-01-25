import wixUsers from 'wix-users';
import { RepositoryFactory } from 'public/todoitems/repository/repositoryfactory.js'
import { local } from 'wix-storage';
import wixLocation from 'wix-location';

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
	static async getMoveDate(){
        try {
			let ms = new MainService({days:90, days_after_move:0});
			let user = wixUsers.currentUser;
			let email = await user.getEmail();
			if (email) {
				return await ms.repository.getMoveDate( email);
			}
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
    }

	static async setMoveDate(moveDate) {
		try {
			let ms = new MainService({days:90, days_after_move:0});
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
			console.log(`user err ${{email}} ${err.stack}`);
		}
			return await this.repository.get(email);
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}

	}
	async save(toSave) {
		try {
			let user = wixUsers.currentUser;
			let email = await user.getEmail();
			if (email) {
				let key = this.key;
				let toInsert = { tasks: toSave.tasks, email, key };
				return await this.repository.save(toInsert);
			}
		} catch (err) {}
		return await this.repository.save(toSave.tasks);
	}
	async approveUser(query) {
		let userNotApproved = async (userForApproval, token) => {
			return userForApproval.length === 1 && userForApproval.token === token && userForApproval.reqistrationConfirmation === false;
		}
		if (query.token) {
			let userForApproval = await this.repository.getUserForApproval({ token: query.token });
			if (await userNotApproved(userForApproval, query.token)) {
				userForApproval.registrationConfirmation = true;
				return await this.repository.approveUser(userForApproval);
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
		try {
			let user;
			let email;
			let toSave
			try {
				user = await wixUsers.currentUser;
				email = await user.getEmail();
			} catch (err) {
				console.log(`an err in user block! in register for approval ${err.message} ${err.stack} ${err}`);
			}
			toSave = await this.getLocalTasks(email);
			let approve = await this.repository.registerForApproval({ 'token': user.id, 'email': email });
			let res = await this.repository.transfer(toSave, email);

			//return await this.repositoryLocal.clearAll();
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}

	}

}