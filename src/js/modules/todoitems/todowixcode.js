
import wixWindow from 'wix-window';
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { local } from 'wix-storage';


let interval;
let days = 90;
$w.onReady(() => {

    interval = setInterval(() => $w('#html1').postMessage({ ready: "Y" }, "*"), 2000);

    $w("#html1").onMessage(async (event) => {
        clearInterval(interval);
        days = wixWindow.lightbox.getContext().days;
        console.log(`days ${JSON.stringify(days)} ${typeof days === 'number'}`);
        console.log(console.log('WIX_ENV: data received from APP_ENV', event));

        const getEmail = async () => {
            try {
                let user = wixUsers.currentUser;
                return await user.getEmail();

            } catch (err) {
                console.log('user error in getEmail:', err);
                return undefined;
            }
        };
        const getMovementTasks = async () => {

            let result = await wixData.query("MovementTasks").eq("days", days).descending("_updatedDate").find();
            if (result.items) {
                return await $w("#html1").postMessage({ "tasks": result.items, days }, "*");
            }
        };

        const getUserTasks = async (emailaddress) => {
            if (!emailaddress) {
                throw new Error(`User address was not supplied`);
            }
            let result = await wixData.query("UserTasks").eq("email", emailaddress).descending("_updatedDate").find();
            if (result.items) {
                return await $w("#html1").postMessage({ "tasks": result.items, days }, "*");//.then( console.log(`WIX_ENV: data sent to APP_ENV getUserTasks():  ${result.items}`));

            }
        };
        const checkLocal = async () => {
            return await local.getItem(`tasks_${days}`);
        };

        let receivedData = event.data;
        let tasks = receivedData.tasks;
        let useremail = await getEmail();

        if (receivedData.hasOwnProperty("save")) {
            if (!receivedData.tasks) {
                throw new Error(`Tasks were not sent to wix : received data: ${receivedData}`);
            }

            let toSave = {
                tasks: tasks,
                email: useremail,
                days: days
            };
            if (useremail) { // user is signed in, so use collection as storage
                try {
                    await wixData.save("UserTasks", toSave)
                        .then(result => $w("#html1").postMessage({ "saved": "true", "tasks": result, days }, '*'));
                } catch (err) {
                    console.log(`WIX_APP_SAVE_ERR_COLLECTION: ${err}`)
                }
            }

            if (!useremail) { //user not signed in, so use local storage 
                try {
                    local.removeItem(`tasks_${days}`);
                    local.setItem(`tasks_${days}`, JSON.stringify(toSave));
                    let model = JSON.parse(local.getItem(`tasks_${days}`));
                    $w("#html1").postMessage({ "saved": "true", "tasks": model.tasks, days }, '*');
                } catch (err) {
                    console.log(`WIX_APP_SAVE_ERR_LC_STORAGE: ${err}`)
                }
            }
        }

        if (receivedData.hasOwnProperty("get")) {

            if (!useremail) {
                let localdata = await checkLocal();
                console.log(`WIX_ENV: user not signed in, data in local: ${localdata}`);
                if (localdata) {
                    let model = JSON.parse(localdata);
                    return await $w("#html1").postMessage({ "get from local storage": "true", "tasks": model.tasks, days }, '*');
                }

                return await getMovementTasks();
            }

            if (useremail) {
                let localdata = await checkLocal();
                if (localdata) {

                    let toSave = {
                        "tasks": JSON.parse(localdata),
                        "email": useremail,
                        days
                    };
                    try {
                        return await wixData.save("UserTasks", toSave)
                            .then(result => $w("#html1").postMessage({ "saved_collection": "true", "tasks": result.tasks, days }, '*'));
                    } catch (err) {
                        console.log(`WIX_APP_SAVE_ERR_COLLECTION: ${err}`)
                    }

                    $w("#html1").postMessage({ "tasks": localdata.tasks, days }, "*");

                }
                try {
                    return await getUserTasks(useremail).then(result => $w("#html1").postMessage({ "tasks": result.tasks, days }, "*"));
                } catch (error) {
                    console.log(`WIX ERROR GET USER TASKS ${error}`);
                }

            }
        }

    });
});


export async function button1_click(event) {
    try {
        let options = { "suppressAuth": true, "suppressHooks": false };
        $w("#html1").postMessage({ "save": "Y" }, "*");
    } catch (error) {
        console.log(error);
    }

}