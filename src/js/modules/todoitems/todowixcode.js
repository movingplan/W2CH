import { local } from 'wix-storage';
import wixData from 'wix-data';

export async function CountOfCompleted(days) {
    const DATA_KEY = `tasks_${days.days}_${days.days_after_move}`;
    let count = 0, total = 0;
    let items = await getFromLocal(DATA_KEY);
    if (items) {
        total = items.tasks.length;
        let completed = Array.prototype.map.call(items.tasks, (item) => {
            if (item.state === 'completed') {
                return item;
            }
        });
        count = completed.length;
    } else {
        let result = await getMovementTasks(days);
        if (result.items.length > 0) {
            total = result.item.length;
        }
    }
    return await `${count} of ${total}`

}
const getFromLocal = (key) => {
    return local.getItem(key);
};
const getMovementTasks = async (days) => {
    return await wixData.query("MovementTasks").eq("days", days.days).eq("days_after_move", days.days_after_move).descending("_updatedDate").find();
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

            let localdata = getFromLocal();
            if (localdata) {
                let dataInLocalStorage = JSON.parse(localdata);
                return await component.postMessage({ "get from local storage": "true", "tasks": dataInLocalStorage.tasks, "days": days }, '*');
            }

            let result = await getMovementTasks(days);
            return await component.postMessage({ "tasks": result.items, "days": days }, "*");
        }

    } catch (err) {
        console.log(`WIX_APP_SAVE_ERR_LC_STORAGE: ${err}`)
    }
}

