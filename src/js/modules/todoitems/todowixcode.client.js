import wixWindow from 'wix-window';
import { local } from 'wix-storage';
import { todoItemsHandleMessage } from 'public/todoitems/services/todoitems.service.js'


function onMessageHandler(days, component, interval) {
    return function (event) {
        todoItemsHandleMessage(event, days, component, interval, local);//.then(res=>console.log(`to do promise ${res}`))
    }
}

$w.onReady(() => {
    try {
        let component = $w("#html1");
        let interval = setInterval(() => component.postMessage({ ready: "Y" }, "*"), 2000);
        let days = wixWindow.lightbox.getContext().days; // {days, days_after_move}
        component.onMessage(onMessageHandler(days, component, interval));
    } catch (err) {
        console.log(`Error ${JSON.stringify(err)}`);
    }

});