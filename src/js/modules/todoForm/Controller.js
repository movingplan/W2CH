import * as app from "../../lib/app";
//import * as data from "../../json/data";
import * as ToDoMessage from "./todomessage";
"use strict"

/*
  Extends `app.Controller`
      Properties: `model`, `view`
      Methods: `bind()` for DOM selectors
*/
export default class extends app.Controller {
    
    constructor() {
        super();
        
        window.onmessage = event => { this.registerOnMessageReceivedHandler(event) };

        this.model.on('change', (e) => {
            console.log('model changed from controller ', e);
            this.renderToDoItems();
        });

       
        this.bind({
            '#addBtn': (el, model, view, controller) => {
                el.onclick = (e) => {
                    this.addToDoItem(e);
                }
            }
        });
        // this.bind({
        //     '#debug': (el, model, view, controller) => {
        //         el.onclick = (e) => {
        //             //this.saveItems();
        //         };
        //     }
        // });
        // this.bind({
        //     '#todolist': (el, model, view, controller) => {
        //         el.onclick = (e) => {
        //             //this.saveItems();
        //         };
        //     }
        // });
        let initData = {
            get: "Y"
        };
        window.parent.postMessage(initData, "*");
    }
    sendMessageToWix(jsObj) {
        
        console.log('APP_ENV: sending to wix:', jsObj)
        window.parent.postMessage(jsObj, "*");
    }
    saveItems() {
        let message = { dataToSave: () => this.model.get("tasks").toJSON() };
        this.view.get(".debugArea").innerHTML = JSON.stringify(this.model.get("tasks"));
    }

    //send object not literal
    getItems() {
        let initData = {
            get: "Y"
        };
        console.log('APP_ENV: sending to wix:', initData)
        window.parent.postMessage(initData, "*");
    }

    registerOnMessageReceivedHandler(event) {
        console.log("APP_ENV: data received from wix in registerOnMessageReceivedHandler: ", event);
        if (event.data) {
            if ( event.data.hasOwnProperty("save")) {
                let model = this.model.get('tasks')
                let data = {
                    tasks: model,
                    save : "Y"
                }
                this.sendMessageToWix(data);
            }
            if ( event.data.hasOwnProperty("saved")) {
                this.model.set('tasks', event.data.tasks);
            }
            if ( event.data.hasOwnProperty("tasks")) {
                this.model.set({ 'tasks': event.data.tasks });
            }
        }
    }

    createGuid() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    addToDoItem(el) {
        let title = this.view.get("#todo").value;
        if(!title) return ;
        let guid = this.createGuid();
        data = {tasks: this.model.get('tasks')};
        data.tasks.push({ '_id': guid, 'title': title, 'state': "custom" });
        this.model.set({ 'tasks': data.tasks });
        console.log('item added, model state:', this.model.get('tasks'));
        this.view.get("#todo").value = '';
    }

    setModelState(el) {
        let dataset = el.path.filter(e => e.tagName === 'LI')[0].dataset;
        console.log(dataset);
        data.tasks.map(function (value, index, arr) {
            if (value._id === dataset.id) {
                value.state = dataset.state;
            }
            return value;
        });
        this.model.set({ 'tasks': data.tasks });
        
    }

    renderToDoItems() {
        // Click on a close button to hide the current list item
        let model = this.model.get("tasks");
        if (!model) { return; }
        let list = Array.prototype.map.call(model, (item) => {
            let _class = "";
            if (item.state === "deleted") {
                return "";
            }
            if (item.state === "completed") {
                _class = "checked";
            }
            return `<li data-state="${!item.state ? "default" : item.state}" data-id="${item._id}" class="${_class ? "checked" : ""}">
                        <label class="checkbox-container ${_class}"> 
                            <input type="checkbox" ${_class ? "checked" : ""} class="${_class ? "checked" : ""}">${item.title}<span class="checkmark"></span> 
                        </label><span class="close">×</span>
                    </li>`
        });

        this.view.get("#todolist").innerHTML = list.join("");
        let close = this.view.getAll("span.close");

        for (let i = 0; i < close.length; i++) {
            close[i].onclick = (e) => {
                e.preventDefault();
                let li = close[i].parentElement;
                li.style.display = "none";
                li.dataset.state = "deleted";
                this.setModelState(e);
            };
        }
        let inputs = this.view.getAll("input");

        for (let i = 0; i < inputs.length; i++) {
            inputs[i].onclick = (e) => {
                console.log(e);
                let i = e.target;

            };
        }

        let listElements = this.view.getAll("li");
        for (let i = 0; i < listElements.length; i++) {
            listElements[i].onclick = (e) => {
                    if (e.srcElement.tagName === "SPAN") return;
                    let li;
                    let input;
                    if (e.target.tagName === 'LABEL') {
                        li = e.srcElement.parentElement;
                        input = e.srcElement.children[0];
                    }
                    if (e.target.tagName === 'SPAN') {
                        li = e.srcElement.parentElement.parentElement;
                        input = e.srcElement;
                    }
                    if (e.target.tagName === 'INPUT') {
                        li = e.srcElement.parentElement.parentElement;
                        input = e.srcElement;
                    }
                    if (e.target.tagName === 'LI') {
                        li = e.srcElement;
                        input = li.children[0].children[0];
                    }

                    if (input.checked) {
                        li.classList.add('checked');
                        li.dataset.state = "completed";
                    } else {
                        li.classList.remove('checked');
                        li.dataset.state = "default";
                    }
                    this.setModelState(e);
                };
        }
    }
                
                    
};