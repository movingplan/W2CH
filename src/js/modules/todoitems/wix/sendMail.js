export async function button11_click(event) {
	try {
        
        let user = await wixUsers.promptLogin( {"mode": "signup"});
        let email = await user.getEmail();
        await wixUsers.emailUser('Verify', user.id, {	variables: { "approvalToken": user.id}});
		await wixData.insert("AccountConfirmation",{'token':user.id, 'email': email});
        await wixLocation.to("/verification");
		
    } catch (err) {
        console.log(`${err.message} ${err.stack}`)
    }
}