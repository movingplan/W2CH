import wixData from 'wix-data';
import { local } from 'wix-storage';

export class CheckListRepository {

    async get() { }

    async list(params, callback) {
        callback = callback || {};
        let query = wixData.query("UserTasks")
        Object.keys(params).map((key) => {
            query = query.eq(key, params[key]);
        });
        return await query.descending("_updatedDate").find();
    }

    async save() {

    }

    async countOfCompleted(days) {
        let count = 0,
            total = 0;
        let result = await this.list(days);
        console.log(`result ${JSON.stringify(result)}`);
        if (result.items.length > 0) {
            total = result.items.length;
        }
        return await `${count} of ${total}`
    }

}

export class CheckListRepositoryLocal {

    constructor(dataKey) {
        this.dataKey = dataKey;
        this.DATA_KEY = this.dataKey;
        console.log(`constructor local, dataKey : ${JSON.stringify(this.DATA_KEY)}`);
    }

    async get() {
        console.log(`async get local checklist  local, dataKey : ${this.dataKey}`);
        return await local.getItem(this.DATA_KEY);
    }

    async list(params, callback) {
        callback = callback || {};
        let query = wixData.query("MovementTasks")
        Object.keys(params).map((key) => {
            query = query.eq(key, params[key]);
        });
        return await query.descending("_updatedDate").find();
    }

    async save(entity) {
        local.removeItem(this.DATA_KEY);
        local.setItem(this.DATA_KEY, JSON.stringify(entity));
        return await JSON.parse(local.getItem(this.DATA_KEY));
    }

    async countOfCompleted() {
        let count = 0,
            total = 0;

        let items = await this.get(this.DATA_KEY);
        if (items) {
            let data = JSON.parse(items);
            total = data.tasks.length;
            console.log(`data tasks: ${JSON.stringify(data.tasks)}`);
            let completed = data.tasks.filter((item) => item.state === 'completed');
            count = completed.length;
        }
        return await `${count} of ${total}`
    }
}