import { RepositoryFactory } from 'public/todoitems/services/repositoryfactory.js'
import wixUsers from 'wix-users';

export class MessageHandler {

	 constructor(event, days, component, interval) {
		this.event = event;
		this.days = days.days;
		this.component = component;
        this.interval = interval;
		let user = wixUsers.currentUser;
		let isLoggedIn = user.loggedIn;
		if (isLoggedIn) {
			this.repository = new RepositoryFactory("checkList").get();
		}
		this.repository = new RepositoryFactory("checkListLocal").get(`tasks_${this.days.days}_${this.days.days_after_move}`);
		if (event) {
			this.init();
		}
	}
  
	async countOfCompleted() {
		return this.repository.countOfCompleted(this.days);
	}

	async init() {
		try {
			let tasks = this.event.data.tasks;
			console.log(console.log('WIX_ENV: data received from APP_ENV', this.event.data));

			if (this.event.data.hasOwnProperty("save")) {
				if (!tasks) {
					throw new Error(`Tasks were not sent to wix : received data: ${this.event.data}`);
				}

				let entity = {
					tasks: tasks,
					email: undefined,
					movedate: undefined
				};
				let localData = await this.repository.save(entity);
				return await this.component.postMessage({ "saved": "true", "tasks": localData.tasks, "days": this.days }, '*');
			}

			if (this.event.data.hasOwnProperty("get")) {
				let localdata = await this.repository.get();
				if (localdata) {
					let dataLs = JSON.parse(localdata);
					return await this.component.postMessage({ "get from local storage": "true", "tasks": dataLs.tasks, "days": this.days }, '*');
				}
				let result = await this.repository.list(this.days);
				return await this.component.postMessage({ "tasks": result.items, "days": this.days }, "*");
			}

		} catch (err) {
			console.log(`WIX_APP_ERR_LC_STORAGE: ${err.message} ${err.stack}`);
            if(this.interval){
                clearInterval(this.interval)
            }
		}
	}

	
}