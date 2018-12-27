import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { MessageHandler } from 'public/todoitems/services/todoitems.service.js'

function onMessageHandler(days, component, interval) {
	let handler;
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