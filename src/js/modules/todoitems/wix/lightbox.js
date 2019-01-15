import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { MessageHandlerService as MessageHandler } from 'public/todoitems/services/messagehandler.service.js'
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixData from 'wix-data'
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
		interval = setInterval(() => component.postMessage({ ready: "Y" }, "*"), 2000);
		let days = wixWindow.lightbox.getContext(); // {days, days_after_move}
		component.onMessage(onMessageHandler(days, component, interval));
        
	} catch (err) {
		console.log(`Error ${JSON.stringify(err)}`);
	}

});

