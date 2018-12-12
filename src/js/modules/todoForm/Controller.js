import * as app from "../../lib/app";
import * as data from "../../json/data";
"use strict"

/*
  Extends `app.Controller`
      Properties: `model`, `view`
      Methods: `bind()` for DOM selectors
*/
export default class extends app.Controller {

    constructor() {
        super();

        window.onmessage = event => this.registerOnMessageReceivedHandler(event);
           
        this.bind({
            '#addBtn': (el, model, view, controller) => {
                el.onclick = (e) => {
                    this.addToDoItem();
                }
            }
        });

       

        this.sendMessage();
        window.parent.postMessage(data, "*");

       
    }

    //send object not literal
    sendMessage() {
        let queryMessageString = '{"query": {"key" : "days", "param": 90, "collectionName": "MovementTasks"}}';
        let qmObject = JSON.parse(queryMessageString);
        window.parent.postMessage(qmObject, "*");
    }

    registerOnMessageReceivedHandler(event) {
        console.log("APP_ENV: incoming data", event);
        if (event.data) {
            console.log("APP_ENV: data received in registerOnMessageReceivedHandler handler", event);
            if(event.data && event.data.hasOwnProperty("tasks")){
                this.model.set({'tasks' : event.data.tasks});
            }
            //this.renderToDoItems();
        }
    }

    addToDoItem(el) {
        let title = this.view.get("#todo").value;
        data.tasks.push({ 'title': title, 'state': "custom" });
        //this.renderToDoItems();
        this.view.get("#todo").value = '';
    }

    renderToDoItems() {
        // Click on a close button to hide the current list item
        let model = this.model.get("tasks");
        console.log(this.model, model);
        if(!model) {return; }
        let list = Array.prototype.map.call(model, (item) => {
            let _class = "";
            if (item.state === "deleted") {
                return "";
            }
            if (item.state === "completed") {
                _class = "checked";
            }
            return `<li data-state="${item.state}" data-id="${item._id}" class="${_class}">
                        <label class="checkbox-container ${_class}"> 
                            <input type="checkbox" class="${_class ? "checked" : ""}">${item.title}<span class="checkmark"></span> 
                        </label><span class="close">×</span>
                    </li>`
        });

        this.view.get("#todolist").innerHTML = list.join("");
        let close = this.view.getAll(".close");

        for (let i = 0; i < close.length; i++) {
            close[i].onclick = function () {
                let li = close[i].parentElement;
                li.style.display = "none";
                li.dataset.state = "deleted";
            };
        }
        let listElements = this.view.getAll("li");
        for (let i = 0; i < listElements.length; i++) {
            listElements[i].onclick = function (e) {
                let li = e.target.parentElement;

                if (li.classList) {
                    li.classList.toggle("checked");
                    if (li.classList.contains("checked")) {
                        li.dataset.state = "completed";
                    } else {
                        li.dataset.state = "default";
                    }
                }

            };
        }
    }
};

