import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { MessageHandlerService as MessageHandler } from 'public/todoitems/services/messagehandler.service.js'
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixData from 'wix-data'
import {MainService} from 'public/todoitems/services/main.service.js'

let handler;
function onMessageHandler(days, component, interval) {

	return function (event) {
		handler = new MessageHandler(event, days, component, interval);
	}
}
let interval;
$w.onReady(() => {
	try {
		let component = $w("#html1");
		let days = wixWindow.lightbox.getContext(); // {days, days_after_move}
		console.log(`lightbox days ${days}`);
		interval = setInterval(() => component.postMessage({ ready: "Y",days }, "*"), 2000);
		component.onMessage(onMessageHandler(days, component, interval));
	} catch (err) {
		console.log(`Error ${JSON.stringify(err)}`);
	}

});
export async function button11_click(event) {
	try {
        
        let user = await wixUsers.promptLogin( {"mode": "signup"});
        await wixUsers.emailUser('Verify', user.id, {	variables: { "approvalToken": user.id}});
        await new MainService(wixWindow.lightbox.getContext()).registerForApprovalAndTransfer(user);
		await wixLocation.to("/verification");
		
    } catch (err) {
        console.log(`${err.message} ${err.stack}`)
    }
}