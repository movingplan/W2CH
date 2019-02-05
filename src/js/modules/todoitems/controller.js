import * as app from "../../lib/app";
import * as ToDoViewModel from "../todoitems/todoviewmodel";
//import * as data from "../../json/data";

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
            console.log(`model changed`);
            this.view.setTitle(this.model.get('days'));
            this.view.renderToDoItems(this.model.get('tasks'));

            this.bind({
                'span.close': (el, model, view, controller) => {
                    el.onclick = (e) => this.removeToDoItem(e);
                }
            })
            this.bind({
                'li': (el, model, view, controller) => {
                    el.onclick = (e) => this.changeToDoItemStatus(e);
                }
            })
        });

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

        //setTimeout(() => { this.model.set({ 'tasks': data.tasks, 'days': { days: 90, days_after_move: 0 } }) }, 1000);
    }

    changeToDoItemStatus(e) {
        if (e.srcElement.tagName === "SPAN") return;
        let li, input, label;
       
        ({ li, input, label } = this.getClicked(e, li, input, label));

        if (input.checked) {
            li.classList.add('checked');
            if(label){
                label.classList.add(`checkbox-container`);
                label.classList.add('checked');
            }
            li.dataset.state = "completed";
        } else {
            if(label){
                label.classList.remove('checked');
                label.classList.add(`checkbox-container`);
            }
            li.classList.remove('checked');
            li.dataset.state = "default";
        }
        let data = this.getModelState(e);
        this.model.set({ 'tasks': data.tasks });

        // this.sendMessageToWix({
        //     tasks: this.model.get('tasks'),
        //     POST: "POST"
        // });

    }

    getClicked(e, li, input,label) {
        if (e.target.tagName === 'LABEL') {
            li = e.srcElement.parentElement;
            input = e.srcElement.children[0];
            label = e.target;
        }
        if (e.target.tagName === 'SPAN' || e.target.tagName === 'INPUT') {
            li = e.srcElement.parentElement.parentElement;
            input = e.srcElement;
            label = e.srcElement.parentElement;
        }
        if (e.target.tagName === 'LI') {
            li = e.srcElement;
            input = li.children[0].children[0];
            label = li.children[0];
        }
        return { li, input, label };
    }

    removeToDoItem(event) {
        this.view.confirm(``, "Möchten Sie diese Aufgabe wirklich von Ihrer Checkliste entfernen?", (dataset) => {

            let tasks = this.model.get('tasks');
            this.model.set({
                'tasks': tasks.map(function (value, index, arr) {
                    if (value._id === dataset.id) {
                        value.state = dataset.state;
                    }
                    return value;
                })
            });

            // this.sendMessageToWix({
            //     tasks: this.model.get('tasks'),
            //     POST: "POST"
            // });
        }, () => { }, event);
    }

    addToDoItem(e) {
        let title = this.view.get("#todo").value;
        if (!title) return;
        let todo = new ToDoViewModel.default(this.model.get('days'), title, "custom");

        let data = { tasks: this.model.get('tasks') };


        if (data.tasks.length > 0) {
            data.tasks.unshift(todo);
        } else {
            data.tasks = [todo];
        }

        this.view.addItem(todo);

        console.log('item added, model state:', this.model.get('tasks'));

        this.model.set({ 'tasks': data.tasks });
        this.view.get("#todo").value = '';
        // this.sendMessageToWix({
        //     tasks: this.model.get('tasks'),
        //     POST: "POST"
        // });

    }

    sendMessageToWix(jsObj) {
        console.log('APP_ENV: sending to wix:', jsObj)
        window.parent.postMessage(jsObj, "*");
    }

    prepareGetDataFromWix() {
        let data = {
            GET: "GET"
        }
        return data;
    }

   
    fromSyncCalendar(data) { //data is event.data
        let { syncCalendar } = data;
        return syncCalendar;
    }

    registerOnMessageReceivedHandler(event) {
        console.log("APP_ENV: data received from wix in registerOnMessageReceivedHandler: ", event);

        if (event.data) {

            let { tasks, days, ready, saveAll, beforeRegister, syncCalendar, error } = event.data;

            if(error){
                this.view.info(`Error`, `${JSON.stringify(error)}`);
                return;
            }

            if (tasks) {
                this.model.set({ 'tasks': tasks, 'days': days });
            }
            if (syncCalendar) {
                this.view.info(``, `Wir arbeiten daran, Ihnen dieses Feature zur Verfügung zu stellen`);
                return;
            }
            if (saveAll) {
               
                if (!beforeRegister) {
                    this.view.info(``, `Ihre Daten wurden erfolgreich gespeichert.`);
                }
                this.sendMessageToWix({
                    tasks: this.model.get('tasks'),
                    POST: "POST"
                });
            }

            if (ready) {
                this.sendMessageToWix(this.prepareGetDataFromWix());
            }
        }
    }
    getModelState(el) {
        let dataset = el.path.filter(e => e.tagName === 'LI')[0].dataset;
        let data = { tasks: this.model.get('tasks') } || { tasks: {} };
        if (data.tasks) {
            data.tasks.map(function (value, index, arr) {
                if (value._id === dataset.id) {
                    value.state = dataset.state;
                }
                return value;
            });
        }
        return data;
    }
};