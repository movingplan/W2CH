import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { MessageHandlerService as MessageHandler } from 'public/todoitems/services/messagehandler.service.js'
import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixData from 'wix-data'
import { MainService } from 'public/todoitems/services/main.service.js'

let saveText = `Ups...
Die Online-Checkliste kann nur von registrierten Benutzern abgespeichert werden.
Bitte melden Sie sich mit Ihrem Benutzernamen und Passwort an, oder registrieren Sie sich.`;

let calendarSyncText = `Ups...
Die Kalender-Synchronisation ist nur für registrierte Benutzer möglich.
Bitte melden Sie sich mit Ihrem Benutzernamen und Passwort an, oder registrieren Sie sich.`;

let pdfDownloadText = `Ups...
Die PDF-Funktion ist nur für registrierte Benutzern verfügbar.
Bitte melden Sie sich mit Ihrem Benutzernamen und Passwort an, oder registrieren Sie sich.`;

let hasToRegisterToBeAbleToRead = `In order to continue reading article blogs, please register or login...`;

let customActionText = `Der persönliche Umzugsplaner steht nur registrierten Benutzern zur Verfügung.
Bitte melden Sie sich mit Ihrem Benutzernamen und Passwort an, oder registrieren Sie sich.`;

$w.onReady(function () {
   
    if (wixUsers.currentUser.loggedIn) {
        wixLocation.to("/account/my-acount");
        return;
    }

    let receivedData;
    
    try {
        receivedData = wixWindow.lightbox.getContext();
    } catch (e) {

    }
    console.log(`received data ${receivedData}`);
    if (!receivedData) {
        $w('#text1').text = customActionText;
    }

    if (receivedData) {
        if (receivedData.mode) {
            if (receivedData.mode === 'save') {
                $w('#text1').text = saveText;
            }
            if (receivedData.mode === 'pdf') {
                $w('#text1').text = pdfDownloadText;
            }
            if (receivedData.mode === 'calendar') {
                $w('#text1').text = calendarSyncText;
            }

            if (receivedData.mode === 'exceededReadingQuota') {
                $w('#text1').text = hasToRegisterToBeAbleToRead;
            }
        }
    }
    $w('#button1').onClick(async () => {
        try {
            let user = await wixUsers.promptLogin({ "mode": "signup", "lang": "de" });
            let days = { days: 90, days_after_move: 0 };
            let ms = new MainService(days);
            await ms.registerForApprovalAndTransfer(user);
            await wixUsers.emailUser('Verify', user.id, { variables: { "approvalToken": user.id } });
            await wixWindow.openLightbox(`Verification`);
                       
        } catch (err) {
            console.log(`${err.message} ${err.stack}`)
        }

    });

    $w('#button2').onClick(async () => {
        try {
            let user = await wixUsers.promptLogin({ "mode": "login", "lang": "de" });
             await wixWindow.openLightbox(`Verification`);
             await wixWindow.lightbox.close();

        } catch (err) {
            console.log(`${err.message} ${err.stack}`)
        }
    });


});






