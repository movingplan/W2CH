import wixData from 'wix-data';
import { local } from 'wix-storage';

export class CheckListRepository {

	async get() {}

	async list(params, callback) {
		callback = callback || {};
		let query = wixData.query("UserTasks")
		Object.keys(params).map((key) => {
			query = query.eq(key, params[key]);
		});
		return query.descending("_updatedDate").find();
	}

	async save() {

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

	constructor(dataKey) {
		this.DATA_KEY = dataKey;
	}

	async get() {
		return local.getItem(this.DATA_KEY);
	}
	async clearAll (dataKey){
		return local.removeItem(dataKey);
	}
	async list(params, callback) {
		callback = callback || {};
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
			total = data.tasks.length;
			
			let completed = data.tasks.filter((item) => item.state === 'completed');
			count = completed.length;
			console.log(`CountOfCompleted: ${count} of ${total}`);
		}
		return `${count} of ${total}`
	}
}