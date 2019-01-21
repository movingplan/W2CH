import wixData from 'wix-data';
import { local } from 'wix-storage';
import wixUsers from 'wix-users';
export class CheckListRepository {
	constructor(days) {
		this.days = days;
	}
	//let userForApproval = repository.get({token:query.token, "AccountConfirmation"});
	async approveUser(userForApproval) {
		return await wixData.save("AccountConfirmation", userForApproval);
	}
	async getUserForApproval(token) {
		return await this.get({ token: token }, "AccountConfirmation");
	}
	async setMoveDate(emailAndDate) {
		let [email, moveDate] = emailAndDate;
		try {
			let checkLists = this.get({ email: email }, "UserTasks");
			if (checkLists.items.length > 0) {
				checkLists.forEach(item => item.moveDate = moveDate);
				return await wixData.bulkUpdate("UserTasks", checkLists);
			}
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
	}

	async get(filter) {
		try {
			let userTasks = this.get(filter, "UserTasks");
			if (userTasks.items.length === 1) {
				return await userTasks.items[0].tasks;
			}
		} catch (e) {}
	}

	async get(params, collection) {
		try {
			let query = wixData.query(collection)
			Object.keys(params).map((key) => {
				query = query.eq(key, params[key]);
			});
			return await query.find();
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}

	}

	async save(toSave) {
		try {
			let todo = this.get({ email: toSave.email, key: toSave.key }, "UserTasks");
			if (todo.items.length === 1) {
				todo.tasks = toSave.tasks;
				return await wixData.update("UserTasks", todo);
			}
			return await wixData.save("UserTasks", toSave);
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
	}

	async transfer(userTasks) {
		try {
			if (!userTasks) {
				throw new Error("there is nothing to save");
			}
			let userTasksExist = await this.get({ email: userTasks.email }, "UserTasks");
			if (userTasksExist.items.length === 0) {
				return await wixData.bulkSave("UserTasks", userTasks);
			}
		} catch (err) {
			console.log(`an err was issued ${err.message} ${err.stack}`);
		}
	}

	async registerForApproval(toSave) {
		try {
			return await wixData.insert("AccountConfirmation", toSave);
		} catch (err) {
			console.log(`an err was issued ${err.message} ${err.stack}`);
		}
	}
	async countOfCompleted(days) {
		let key = `tasks_${days.days}_${days.days_after_move}`;
		let user = wixUsers.currentUser;
		let email = await user.getEmail();
		if (!email) return;
		let data = this.get({ key, email }, "UserTasks");
		if (data.items.length === 1) {
			let tasks = data.items[0].tasks;
			let obj = JSON.parse(tasks);
			let count = obj.filter(item => item.state === 'completed').length;
			let total = obj.filter(item => item.state !== 'deleted').length;
			return `${count} of ${total}`
		}

		let result = await this.get(days, "MovementTasks");

		let total = 0,
			count = 0;

		if (result.items.length > 0) {
			total = result.items.filter(item => item.state !== 'deleted').length;
			count = result.items.filter(item => item.state === 'completed').length;
		}

		return `${count} of ${total}`
	}

}

export class CheckListRepositoryLocal {

	constructor(days) {
		this.DATA_KEY = `tasks_${days.days}_${days.days_after_move}`;
		this.days = days;
	}

	async registerForApproval(toSave) {
		throw new Error("not implemented...");
	}

	async transfer(userTasks) {
		throw new Error("not implemented in repository local");
	}
	async get(params, collection) {
		try {
			let query = wixData.query(collection)
			Object.keys(params).map((key) => {
				query = query.eq(key, params[key]);
			});
			return await query.find();
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}

	}
	async get() {
		let localdata = local.getItem(this.DATA_KEY);
		if (localdata) {
			let todos = JSON.parse(localdata);
			return await { items: todos.tasks };
		}
		let result = await this.repository.get(this.days, "MovementTasks");
		return await result;
	}

	async clearAll() {
		return local.removeItem(this.DATA_KEY);
	}
	async getAllPredefinedTasks() {
		try {
			return await wixData.query("MovementTasks").find()
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
	}

	async save(entity) {
		local.removeItem(this.DATA_KEY);
		local.setItem(this.DATA_KEY, JSON.stringify(entity));
		return JSON.parse(local.getItem(this.DATA_KEY));
	}

	async countOfCompleted() {
		let count = 0,
			total = 0;

		let items = await this.get(this.DATA_KEY);

		if (items) {
			let data = JSON.parse(items);
			total = data.tasks.filter(item => item.state !== 'deleted').length;
			let completed = data.tasks.filter((item) => item.state === 'completed');
			count = completed.length;
			console.log(`CountOfCompleted: ${count} of ${total}`);
		}

		if (count === 0 && total === 0) {
			let days = this.days;
			let result = await this.get(days, "MovementTasks");

			if (result.items.length > 0) {
				total = result.items.filter(item => item.state !== 'deleted').length;
				count = result.items.filter(item => item.state === 'completed').length;
			}
		}
		return `${count} of ${total}`
	}
}