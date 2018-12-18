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
            console.log(`model changed, view ${this.view}, model toJSON: ${JSON.stringify(this.model.toJSON())}`)
            this.view.renderToDoItems(this.model.get('tasks'));
        });

        this.bind({
            'span.close' :(close, model,view,controller) => {
               
                for (let i = 0; i < close.length; i++) {
                    close[i].onclick = (e) => {
                        e.preventDefault();
                        let li = close[i].parentElement;
                        li.style.display = "none";
                        li.dataset.state = "deleted";
                        let data = this.getModelState(e);

                        this.model.set({ 'tasks': data.tasks });
    
                        this.sendMessageToWix({
                            tasks: this.model.get('tasks'),
                            save: "Y"
                        });
                    };
                }
            }
        })
        this.bind({
            'li' :(listElements, model, view, controller) =>{
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
                        let data = this.getModelState(e);
                        this.model.set({ 'tasks': data.tasks });

                        this.sendMessageToWix({
                            tasks: this.model.get('tasks'),
                            save: "Y"
                        });
                    };
                }
            }
        })
        this.bind({
            '#addBtn': (el, model, view, controller) => {
                el.onclick = (e) => this.addToDoItem(e);
            }
        });
        this.bind({
            '#todo': (el, model, view, controller) => {
                el.onkeypress = (e) => {

                    let code = (e.keyCode ? e.keyCode : e.which);

                    if (code == 13) { //Enter keycode
                        this.addToDoItem(e);
                    }
                }
            }
        });
    }
    addToDoItem(e){
 
            let title = this.view.get("#todo").value;
            if (!title) return;
            let guid = this.createGuid();
            let data = { tasks: this.model.get('tasks') };

            if (data.tasks.length > 0) {
                data.tasks.unshift({ '_id': guid, 'title': title, 'state': "custom" });
            } else {
                data.tasks = [{'_id': guid, 'title': title, 'state': "custom"}];
            }

            console.log('item added, model state:', this.model.get('tasks'));
            this.model.set({ 'tasks': data.tasks });
            this.view.get("#todo").value = '';

            this.sendMessageToWix({
                tasks: this.model.get('tasks'),
                save: "Y"
            });
      
    }
    sendMessageToWix(jsObj) {
        console.log('APP_ENV: sending to wix:', jsObj)
        window.parent.postMessage(jsObj, "*");
    }

    prepareGetDataFromWix() {
        let model = this.model.get('tasks')
        let data = {
            tasks: model,
            get: "Y"
        }
        return data;
    }

    isReadyOrSave(event) {
        return event.data.hasOwnProperty("ready") || event.data.hasOwnProperty("save");
    }
    isSavedOrGet(event) {
        return event.data.hasOwnProperty("saved") || event.data.hasOwnProperty("tasks");
    }
    registerOnMessageReceivedHandler(event) {
        console.log("APP_ENV: data received from wix in registerOnMessageReceivedHandler: ", event);
        if (event.data) {
            if (this.isReadyOrSave(event)) {
                this.sendMessageToWix(this.prepareGetDataFromWix());
            }

            if (this.isSavedOrGet(event)) {
                this.model.set({'tasks' : event.data.tasks, 'days': event.data.days });
            }
        }
    }

    createGuid() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }
   
    getModelState(el) {
        let dataset = el.path.filter(e => e.tagName === 'LI')[0].dataset;
        console.log(dataset);
        let data = { tasks: this.model.get('tasks') };
        data.tasks.map(function (value, index, arr) {
            if (value._id === dataset.id) {
                value.state = dataset.state;
            }
            return value;
        });
        return data;

    }

};