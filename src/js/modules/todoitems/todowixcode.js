
import wixData from 'wix-data';


export async function todoItemsHandleMessage(event, days, component, interval, local) {
    const DATA_KEY = `tasks_${days.days}_${days.days_after_move}`;
    clearInterval(interval);
    console.log(`HELLO days selected : ${JSON.stringify(days)}`);

    try {
        let receivedData = event.data;
        let tasks = receivedData.tasks;

        console.log(`days ${JSON.stringify(days)} ${typeof days === 'number'}`);
        console.log(console.log('WIX_ENV: data received from APP_ENV', event));

        const getMovementTasks = async () => {
            return await wixData.query("MovementTasks").eq("days", days.days).eq("days_after_move", days.days_after_move).descending("_updatedDate").find();
        };

        const getFromLocal = () => {
            return local.getItem(DATA_KEY);
        };

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
            return component.postMessage({ "saved": "true", "tasks": localData.tasks, "days": days }, '*');
        }

        if (receivedData.hasOwnProperty("get")) {

            let localdata = getFromLocal();
            if (localdata) {
                let dataInLocalStorage = JSON.parse(localdata);
                return component.postMessage({ "get from local storage": "true", "tasks": dataInLocalStorage.tasks, "days": dataInLocalStorage.days }, '*');
            }

            let result = await getMovementTasks();
            return component.postMessage({ "tasks": result.items }, "*");
        }

    } catch (err) {
        console.log(`WIX_APP_SAVE_ERR_LC_STORAGE: ${err}`)
    }
}

