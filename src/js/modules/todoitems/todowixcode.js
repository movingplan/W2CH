import { local } from 'wix-storage';
import { RepositoryFactory } from 'public/todoitems/services/todoitems.dataservice.js'

export async function CountOfCompleted(days) {
	const DATA_KEY = `tasks_${days.days}_${days.days_after_move}`;
	let count = 0,
		total = 0;

	let items = await getFromLocal(DATA_KEY);
	if (items) {
		let data = JSON.parse(items);
		total = data.tasks.length;
		console.log(`data tasks: ${JSON.stringify(data.tasks)}`);
		let completed = data.tasks.filter((item) => item.state === 'completed');

		count = completed.length;
	} else {
		let result = await getMovementTasks(days);
		console.log(`result ${JSON.stringify(result)}`);
		if (result.items.length > 0) {
			total = result.items.length;
		}
	}
	return await `${count} of ${total}`

}
const getFromLocal = async (key) => {
	return local.getItem(key);
};

const getMovementTasks = async (days) => {
	let repository = new RepositoryFactory("movementtasks").get();
	let params = { "days": days.days, "days_after_move": days.days_after_move };
	return await repository.list(params);
};

export async function todoItemsHandleMessage(event, days, component, interval) {
	const DATA_KEY = `tasks_${days.days}_${days.days_after_move}`;
	clearInterval(interval);
	console.log(`HELLO days selected : ${JSON.stringify(days)}`);

	try {
		let receivedData = event.data;
		let tasks = receivedData.tasks;

		console.log(`days ${JSON.stringify(days)} ${typeof days === 'number'}`);
		console.log(console.log('WIX_ENV: data received from APP_ENV', event));

		if (receivedData.hasOwnProperty("save")) {
			if (!receivedData.tasks) {
				throw new Error(`Tasks were not sent to wix : received data: ${receivedData}`);
			}

			let toSave = {
				tasks: tasks,
				email: undefined,
				movedate: undefined
			};

			local.removeItem(DATA_KEY);
			local.setItem(DATA_KEY, JSON.stringify(toSave));
			let localData = JSON.parse(local.getItem(DATA_KEY));
			return await component.postMessage({ "saved": "true", "tasks": localData.tasks, "days": days }, '*');
		}

		if (receivedData.hasOwnProperty("get")) {

			let localdata = await getFromLocal(DATA_KEY);
			if (localdata) {
				let dataInLocalStorage = JSON.parse(localdata);
				return await component.postMessage({ "get from local storage": "true", "tasks": dataInLocalStorage.tasks, "days": days }, '*');
			}

			let result = await getMovementTasks(days);
			return await component.postMessage({ "tasks": result.items, "days": days }, "*");
		}

	} catch (err) {
		console.log(`WIX_APP_ERR_LC_STORAGE: ${err.message} ${err.stack}`)
	}
}