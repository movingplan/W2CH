import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { MessageHandlerService as MessageHandler } from 'public/todoitems/services/messagehandler.service.js'
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixData from 'wix-data'
import { MainService } from 'public/todoitems/services/main.service.js'

$w.onReady(function () {
	//TODO: write your page related code here...

});
export async function button1_click(event) {
	try {

		let user = await wixUsers.promptLogin({ "mode": "signup", "lang": "de" });
		console.log(`after promt`, user, wixWindow.lightbox.getContext());
		let days = { days: 90, days_after_move: 0 };
		let ms = new MainService(days);
		await ms.registerForApprovalAndTransfer();
		await wixUsers.emailUser('Verify', user.id, { variables: { "approvalToken": user.id } });
		await wixLocation.to("/verification");

	} catch (err) {
		console.log(`${err.message} ${err.stack}`)
	}

}