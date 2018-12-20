
import wixData from 'wix-data';
//import wixUsers from 'wix-users';


export function todoItemsHandleMessage(event, days, component, interval, local) {

    clearInterval(interval);
    console.log(`HELLO ${JSON.stringify(event), JSON.stringify(days), component}`);

    try {
        let receivedData = event.data;
        let tasks = receivedData.tasks;

        console.log(`days ${JSON.stringify(days)} ${typeof days === 'number'}`);
        console.log(console.log('WIX_ENV: data received from APP_ENV', event));

        const getMovementTasks = async () => {
            return await wixData.query("MovementTasks").eq("days", days.before).eq("days_after_move", days.after).descending("_updatedDate").find();

        };

        const getFromLocal = () => {
            let items = local.getItem(`tasks`);
            console.log(`type of items ${items}`);
            if (items) {
                let list = Array.prototype.map.call(items, (item) => {
                    if (item.days.before === days.before && item.days.after === days.after) {
                        return item;
                    }
                });
                return list;
            }
            return null;
        };


        if (receivedData.hasOwnProperty("save")) {
            if (!receivedData.tasks) {
                throw new Error(`Tasks were not sent to wix : received data: ${receivedData}`);
            }

            let toSave = {
                tasks: tasks,
                email: undefined
            };

            local.removeItem(`tasks`);
            local.setItem(`tasks`, JSON.stringify(toSave));
            let model = JSON.parse(local.getItem(`tasks`));
            component.postMessage({ "saved": "true", "tasks": model.tasks }, '*');


        }

        if (receivedData.hasOwnProperty("get")) {

            let localdata = getFromLocal();
            console.log(`WIX_ENV: user not signed in, data in local: ${localdata}`);
            if (localdata) {
                let model = JSON.parse(localdata);
                return component.postMessage({ "get from local storage": "true", "tasks": model.tasks }, '*');
            }

            let result = await getMovementTasks();
            return await component.postMessage({ "tasks": result.items }, "*");
        }

    } catch (err) {
        console.log(`WIX_APP_SAVE_ERR_LC_STORAGE: ${err}`)
    }
}

