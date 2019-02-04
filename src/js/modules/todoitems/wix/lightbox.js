import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { MessageHandlerService as MessageHandler } from 'public/todoitems/services/messagehandler.service.js'
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixData from 'wix-data'
import { MainService } from 'public/todoitems/services/main.service.js'

let handler;

function onMessageHandler(days, component, interval) {

	return function (event) {
		handler = new MessageHandler(event, days, component, interval);
	}
}
let interval;
let days;
$w.onReady(() => {
	try {
		let component = $w("#html1");
		days = wixWindow.lightbox.getContext(); // {days, days_after_move}
		interval = setInterval(() => component.postMessage({ ready: "Y", days }, "*"), 2000);
		component.onMessage(onMessageHandler(days, component, interval));
	} catch (err) {
		console.log(`Error ${JSON.stringify(err)}`);
	}

});

export async function image4_click(event) {
	if (wixUsers.currentUser.loggedIn === false) {
		clearInterval(interval);
		await wixWindow.lightbox.close();
		await wixWindow.openLightbox("Registration", {mode:'save'});
	} else {
		let component = $w("#html1");
		component.postMessage({ saveAll: "Y" }, "*")
	}
}
export async function image2_click(event) {
	if (wixUsers.currentUser.loggedIn === false) {
		clearInterval(interval);
		await wixWindow.lightbox.close();
		await wixWindow.openLightbox("Registration", {mode:'calendar'});
	} else {
	let component = $w("#html1");
	component.postMessage({ syncCalendar: "Y" }, "*")
}
}
export async function image3_click(event) {
	if (wixUsers.currentUser.loggedIn === false) {
		clearInterval(interval);
		await wixWindow.lightbox.close();
		await wixWindow.openLightbox("Registration", {mode: 'pdf'});
	} else {
	let component = $w("#html1");
	component.postMessage({ pdfExport: "Y" }, "*")
}
}