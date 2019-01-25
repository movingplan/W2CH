import wixData from 'wix-data';
import { local } from 'wix-storage';
import wixUsers from 'wix-users';

export class CheckListRepository {
	constructor(days) {
		this.days = days;
		this.key = `tasks_${days.days}_${days.days_after_move}`;
	}
	async approveUser(userForApproval) {
		let result = await this.find({ token: userForApproval.token }, "AccountConfirmation");
		if(result.items === 0){
			return await wixData.save("AccountConfirmation", userForApproval);
		}
	}
	async getUserForApproval(token) {
		return await this.find({ token: token }, "AccountConfirmation");
	}
	async setMoveDate(emailAndDate) {
		let email = emailAndDate.email;
		let moveDate = emailAndDate.moveDate;
		try {
			let checkLists = await this.find({ email: email }, "UserTasks");
			if (checkLists.items.length > 0) {
				checkLists.items.forEach(item => item.moveDate = moveDate);
				return await wixData.bulkUpdate("UserTasks", checkLists.items);
			}
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
	}

	async find(params, collection) {
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
			
			let todo = await this.find({ email: toSave.email, key: toSave.key }, "UserTasks");
			if (todo.items.length === 1) {
				todo.items[0].tasks = toSave.tasks;
				return await wixData.update("UserTasks", todo.items[0]);
			}
			
			return await wixData.save("UserTasks", toSave);
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
	}

	async transfer(userTasks, email) {
		try {
			if (!userTasks) {
				throw new Error("there is nothing to save");
			}

			let userTasksExist = await this.find({ "email": email }, "UserTasks");
			console.log(`in transfer ${JSON.stringify(userTasks)} length ${userTasks.length}`);

			if (userTasksExist.items.length === 0) {
				console.log(`before save ${JSON.stringify(userTasks), userTasksExist}`);
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
	async countOfCompleted() {
		let days = this.days;
		let user = wixUsers.currentUser;
		let email = await user.getEmail();
		if (!email) return;
		let data = await this.find({ "key": this.key, "email": email }, "UserTasks");
		if (data.items.length === 1) {
			let tasks = data.items[0].tasks;

			let obj = [...(tasks)];
			let count = obj.filter(item => item.state === 'completed').length;
			let total = obj.filter(item => item.state !== 'deleted').length;
			return `${count} of ${total}`
		}

		let result = await this.find(days, "MovementTasks");

		let total = 0,
			count = 0;

		if (result.items.length > 0) {
			total = result.items.filter(item => item.state !== 'deleted').length;
			count = result.items.filter(item => item.state === 'completed').length;
		}

		return `${count} of ${total}`
	}
	async getAllPredefinedTasks() {
		try {
			return await wixData.query("MovementTasks").find()
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
	}
	async get(email) {
		let key = this.key;
		let wixcol = await this.find({"email": email, "key":key}, "UserTasks");
		console.log(wixcol);
		if (wixcol.items.length === 1) {
			let res = wixcol.items[0].tasks;
			return await {items:(res)};
		}
		let result = await this.find(this.days, "MovementTasks");
		return result;

	}
	async getMoveDate( email ) {
		try {
			let result =  await this.find({"email": email}, "UserTasks");
			
			if(result.items.length >=1){
				 let res = result.items.filter(item=>{
				 if(item.moveDate) {
					 return item.moveDate
				 }
				 });
				 if(res.length >=1){
					 return res[0];
				 }
			}

		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
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
	async find(params, collection) {
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
			return await { items: todos };
		}
		
		let days = this.days;
		return await this.find(days, "MovementTasks");

	}

	async clearAll() {
		return local.removeItem(this.DATA_KEY);
	}
	async getAllPredefinedTasks() {
		try {
			return await wixData.query("MovementTasks").find();
		} catch (e) {
			console.log(`an err was issued ${e.message} ${e.stack}`);
		}
	}

	async save(entity) {
		try {
			local.removeItem(this.DATA_KEY);
			local.setItem(this.DATA_KEY, JSON.stringify(entity));
			return await JSON.parse(local.getItem(this.DATA_KEY));
		} catch (err) {
			console.log(`error save in local ${err}`);
		}

	}

	async countOfCompleted() {
		let count = 0,
			total = 0;

		let res = await this.get();
		try {
			if (res) {
				let data = res.items;

				total = data.filter(item => item.state !== 'deleted').length;
				let completed = data.filter((item) => item.state === 'completed');
				count = completed.length;

			}

			return `${count} of ${total}`
		} catch (err) {
			console.log(err);
		}

	}
}