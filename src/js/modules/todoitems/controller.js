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
            this.bindEventListeners();
        });
         //setTimeout(() => { this.model.set({ 'tasks': data.tasks, 'days': { days: 90, days_after_move: 0 } }) }, 1000);
    }

    bindEventListeners() {
        this.bind({
            'span.close': (el, model, view, controller) => {
                el.onclick = (e) => this.removeToDoItem(e,el);
            }
        })
        this.bind({
            'li': (el, model, view, controller) => {
                el.onclick = (e) => this.changeToDoItemStatus(e, el);
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
        this.bind({
            '#debug': (el, model, view, controller) => {
                el.onclick = (e) => {
                    this.view.get('.debugArea').innerHTML = JSON.stringify(this.model.get('tasks'));
                }
            }
        });
    }

    changeToDoItemStatus(e, el) {
        e.preventDefault();
        let li = $(el);
        let i = $(el).find('input');
        let l = $(el).find('label');
        let s = $(el).find('label');
        let a = $(el).find('a');
       // console.log(e.target);
        if(a.length > 0 && e.target.nodeName ==="A"){
            let href = $(a).attr('href');
            window.open(href, '_blank');
            return;
        }
        if (li.attr(`data-state`) !== `completed`) {
            l.addClass('checked');
            li.addClass('checked');
            i.attr("checked",true);
            li.attr(`data-state`, `completed`);
        } else {
            l.removeClass('checked');
            li.removeClass('checked');
            i.attr("checked",false);
            li.attr(`data-state`, `default`);
        }
       
        let data = this.getModelState(e, li);
        this.model.set({ 'tasks': data.tasks });
        this.view.setCounter(data.tasks);

    }
    
    getModelState(el,li) {
        let res = {state: li.attr('data-state'), id: li.attr('data-id')};
        let data = { tasks: this.model.get('tasks') } || { tasks: {} };
        if (data.tasks) {
            data.tasks.map(function (value, index, arr) {
                if (value._id === res.id) {
                    value.state = res.state;
                }
                return value;
            });
        }
        return data;
    }

    getClicked(e, li, input, label) {
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

    removeToDoItem(event, el) {
        event.stopPropagation();
        
        this.view.confirm(``, "Möchten Sie diese Aufgabe wirklich von Ihrer Checkliste entfernen?", (res) => {
            let tasks = this.model.get('tasks');
            console.log(res);
            this.model.set({
                'tasks': tasks.map(function (value, index, arr) {
                    if (value._id === res.id) {
                        value.state = res.state;
                    }
                    return value;
                })
            });
            this.view.setCounter(this.model.get('tasks'));
            $(el).parent('li').hide();
        }, () => { }, el);
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
        this.view.get("#todo").value = '';
        this.model.set({ 'tasks': data.tasks });
        this.view.setCounter(data.tasks);
        this.bindEventListeners();
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

            if (error) {
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
  
};