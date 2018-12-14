import { getTasksBeforeMovePromise } from 'backend/usertasks/services/usertasks.service.jsw'
import { isValidDate } from 'public/common/helpers.js'
import wixWindow from 'wix-window';
import wixData from 'wix-data';
import wixUsers from 'wix-users';
import  {local}  from 'wix-storage';

   
$w.onReady(() => {
 $w("#html1").postMessage({ready: "Y"}, "*");

 $w("#html1").onMessage(async (event) => {

        console.log(console.log('WIX_ENV: data received from APP_ENV', event));

        const getEmail = async () => {
            try {
                let user = wixUsers.currentUser;
                return  await user.getEmail();
                
            } catch (err) {
                console.log('user error in getEmail:', err);
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
        let useremail = await getEmail();

        if (receivedData.hasOwnProperty("save")) {
            if (!receivedData.tasks) {
                throw new Error(`Tasks were not sent to wix : received data: ${receivedData}`);
            }

            let toSave = {
                tasks: tasks,
                email: useremail
            };
            if (useremail) { // user is signed in, so use collection as storage
                try {
                    await wixData.save("UserTasks", toSave)
                        .then(result => $w("#html1").postMessage({ "saved": "true", "tasks": result }, '*'));
                } catch (err) {
                    console.log(`WIX_APP_SAVE_ERR_COLLECTION: ${err}`)
                }
            }

            if (!useremail) { //user not signed in, so use local storage 
                try {
                        local.removeItem("tasks");
                        local.setItem("tasks", JSON.stringify(toSave));
                        let model = JSON.parse(local.getItem("tasks"));
                     $w("#html1").postMessage({ "saved": "true", "tasks": model.tasks }, '*');
                } catch (err) {
                    console.log(`WIX_APP_SAVE_ERR_LC_STORAGE: ${err}`)
                }
            }
        }

        if (receivedData.hasOwnProperty("get")) {
           
            if (!useremail) {
                let localdata = await checkLocal();
                console.log(`WIX_ENV: user not signed in, data in local: ${Promise.resolve(await checkLocal())}`);
                if (localdata) {
                    let model = JSON.parse(localdata);
                   return  $w("#html1").postMessage({ "get from local storage": "true", "tasks": model.tasks }, '*');
                }

                return await getMovementTasks();
            }
            
            if (useremail) {
                let localdata = await checkLocal();
                if (localdata) {
                    console.log(`WIX_ENV: user is signed in ${useremail}, data in local: ${Promise.resolve(await checkLocal())}`);
                    console.log(`WIX_ENV: transfering from local store to collection...`)
                    let toSave = {
                        "tasks": JSON.parse(localdata),
                        "email": useremail
                    };
                    try {
                        wixData.save("UserTasks", toSave)
                            .then(result => $w("#html1").postMessage({ "saved_collection": "true", result }, '*')).then(() => local.removeItem("tasks")).then(() => console.log("WIX_ENV: data transfered to collection and removed from local store"));
                    } catch (err) {
                        console.log(`WIX_APP_SAVE_ERR_COLLECTION: ${err}`)
                    }
                    
                    $w("#html1").postMessage({ "tasks": localdata } , "*");
                   
                }
                try {
                    getUserTasks(useremail).then(result=>$w("#html1").postMessage({ "tasks": result } , "*")).then((e)=>console.log(`get user tasks finished, posted message to APP_ENV ${e}`))
                    
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
        $w("#html1").postMessage({"save":"Y"}, "*");
    } catch (error) {
        console.log(error);
    }

}