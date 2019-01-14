import { MainService } from "./main.service";

export async function button11_click(event) {
	try {
        
        let user = await wixUsers.promptLogin( {"mode": "signup"});
        await wixUsers.emailUser('Verify', user.id, {	variables: { "approvalToken": user.id}});
        await new MainService(this.getContext()).registerForApprovalAndTransfer(user);
		await wixLocation.to("/verification");
		
    } catch (err) {
        console.log(`${err.message} ${err.stack}`)
    }
}