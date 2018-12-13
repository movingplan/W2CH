import { getTasksBeforeMovePromise } from 'backend/usertasks/services/usertasks.service.jsw'
import { isValidDate } from 'public/common/helpers.js'
import wixWindow from 'wix-window';
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import { local } from 'wix-storage';

$w.onReady(() => {

    $w("#html1").onMessage(async (event) => {

        console.log(console.log('WIX_ENV: data received from APP_ENV', event));

        const getEmail = async () => {
            try {
                let user = wixUsers.currentUser;
                return  await user.getEmail();
                
            } catch (err) {
                console.log('user error', err);
                return undefined;
            }
        };
        const getMovementTasks = async () => {
            let daysNum = 90;
            let result = await wixData.query("MovementTasks").eq("days", daysNum).descending("_updatedDate").find();
            if (result.items) {
                await $w("#html1").postMessage({ "tasks": result.items }, "*");
                return console.log(`WIX_ENV: data sent to APP_ENV getMovementTasks():  ${result.items}`);
            }
        };

        const getUserTasks = async (emailaddress) => {
            if(!emailaddress) {
                throw new Error (`User address was not supplied`);
            }
            let result = await wixData.query("UserTasks").eq("email", emailaddress).descending("_updatedDate").find();
            if (result.items) {
                await $w("#html1").postMessage({ "tasks": result.items }, "*");
                return console.log(`WIX_ENV: data sent to APP_ENV getUserTasks():  ${result.items}`);
            }
        };
        const checkLocal = async () => {
            return await local.getItem("tasks");
        };

        let receivedData = event.data;
        let tasks = receivedData.tasks;
        let useremail = getEmail();

        if (receivedData.hasOwnProperty("save")) {
            if (!receivedData.tasks) {
                throw new Error(`Tasks were not sent to wix : received data: ${receivedData}`);
            }

            let toSave = {
                "tasks": JSON.stringify(tasks),
                "email": useremail
            };
            if (useremail) { // user is signed in, so use collection as storage
                try {
                    return await wixData.save("UserTasks", toSave)
                        .then(result => $w("#html1").postMessage({ "saved": "true", "tasks": result }, '*'));
                } catch (err) {
                    console.log(`WIX_APP_SAVE_ERR_COLLECTION: ${err}`)
                }
            }

            if (!useremail) { //user not signed in, so use local storage 
                try {
                    return await local.removeItem("tasks").then(e => local.setItem("tasks", toSave)).then((result) => $w("#html1").postMessage({ "saved": "true", "tasks": result }, '*'));
                } catch (err) {
                    console.log(`WIX_APP_SAVE_ERR_LC_STORAGE: ${err}`)
                }
            }
        }

        if (receivedData.hasOwnProperty("get")) {
            let lclData = checkLocal;
            if (!useremail) {
                let localdata = lclData().then(res => res);
                console.log(`WIX_ENV: user not signed in, data in local: ${localdata}`);
                if (localdata) {
                    return $w("#html1").postMessage({ "tasks": localdata }, "*");
                }

                return await getMovementTasks();
            }
            
            if (useremail) {
                let localdata = lclData().then(res => res);
                if (localdata) {
                    console.log(`WIX_ENV: user is signed in, data in local: ${localdata}`);
                    console.log(`WIX_ENV: transfering from local store to collection...`)
                    let toSave = {
                        "tasks": localdata,
                        "email": useremail
                    };
                    try {
                        return await wixData.save("UserTasks", toSave)
                            .then(result => $w("#html1").postMessage({ "saved_collection": "true", result }, '*')).then(() => local.removeItem("tasks")).then(() => console.log("WIX_ENV: data transfered to collection and removed from local store"));
                    } catch (err) {
                        console.log(`WIX_APP_SAVE_ERR_COLLECTION: $(err)`)
                    }
                    
                    return $w("#html1").postMessage({ "tasks": localdata } , "*");
                   
                }
                return  await getUserTasks(useremail);
            }
        }
      
    });
});


export async function button1_click(event) {
    try {
        let options = { "suppressAuth": true, "suppressHooks": false };
        $w("#html1").postMessage({"save":"Y"}, "*");
    } catch (error) {
        console.log(error);
    }

}