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

		$w('#image4').onClick(() => { //save
			component.postMessage({ saveAll: "Y" }, "*");
			if (wixUsers.currentUser.loggedIn === false) {
				clearInterval(interval);
				//wixWindow.lightbox.close();
				wixWindow.openLightbox("Registration", { mode: 'save' });

			}
		})
		$w('#image2').onClick(() => {

			if (wixUsers.currentUser.loggedIn === false) {
				clearInterval(interval);
				//await wixWindow.lightbox.close();
				wixWindow.openLightbox("Registration", { mode: 'calendar' });
			} else {
				component.postMessage({ syncCalendar: "Y" }, "*")
			}
		});
		$w('#image3').onClick(() => {
			if (wixUsers.currentUser.loggedIn === false) {
				clearInterval(interval);
				//await wixWindow.lightbox.close();
				wixWindow.openLightbox("Registration", { mode: 'pdf' });
			} else {
				component.postMessage({ pdfExport: "Y" }, "*")
			}
		});

	} catch (err) {
		console.log(`Error ${JSON.stringify(err)}`);
	}

});