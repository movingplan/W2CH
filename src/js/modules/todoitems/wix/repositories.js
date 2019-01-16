import wixData from 'wix-data';
import { local } from 'wix-storage';

export class CheckListRepository {

	async get() { }

	async list(params) {
		let query = wixData.query("UserTasks")
		Object.keys(params).map((key) => {
			query = query.eq(key, params[key]);
		});
		return query.descending("_updatedDate").find();
	}

	async save(toSave) {
		throw new Error("nothing implemented");
	}

	async transfer(toSave) {
		throw new Error("nothing implemented");
	}

	async registerForApproval(toSave) {
		throw new Error("nothing implemented");
	}
	async countOfCompleted(days) {
		let count = 0,
			total = 0;
		let result = await this.list(days);
		if (result.items.length > 0) {
			total = result.items.length;
			//count = result.items.tasks.filter((item) => item.state === 'completed').length;
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
		try {
			return await wixData.insert("AccountConfirmation", toSave);
		} catch (err) {
			console.log(`an err was issued ${err.message} ${err.stack}`);
		}
	}

	async transfer(userTasks) {
		try {
			if (!userTasks) {
				throw new Error("there is nothing to save");
			}
			return await wixData.save("UserTasks", userTasks);
		} catch (err) {
			console.log(`an err was issued ${err.message} ${err.stack}`);
		}
	}

	async get() {
		return local.getItem(this.DATA_KEY);
	}
	async clearAll() {
		return local.removeItem(this.DATA_KEY);
	}
	async list(params) {
		let query = wixData.query("MovementTasks")
		Object.keys(params).map((key) => {
			query = query.eq(key, params[key]);
		});
		return query.descending("_updatedDate").find();
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
			let result = await this.list(days);


			if (result.items.length > 0) {
				total = result.items.filter(item => item.state !== 'deleted').length;
				count = result.items.filter(item => item.state === 'completed').length;
			}
		}
		return `${count} of ${total}`
	}
}