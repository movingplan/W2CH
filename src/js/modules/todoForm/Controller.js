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
        this.model.on('change', (e) => {
            console.log('model changed from controller ', e);
            this.renderToDoItems();
        });
        window.onmessage = event => {this.registerOnMessageReceivedHandler(event)};
        this.bind({
            '#addBtn': (el, model, view, controller) => {
                el.onclick = (e) => {
                    this.addToDoItem();
                }
            }
        });
        this.bind({
            '#debug': (el, model, view, controller) => {
                el.onclick = (e) => {
                    this.saveItems();
                }
            }
        });
        this.bind({
            '#todolist': (el, model, view, controller) => {
                el.onchange = (e) => {
                    console.log(e,model);
                }
            }
        });

        this.getItems();
        window.parent.postMessage(data, "*");
       
    }
    saveItems(){
        let message = {"dataToSave": ()=>this.model.get("tasks").toJSON()};
        //let qmObject = JSON.parse(message);
       this.view.get(".debugArea").innerHTML =  JSON.stringify(this.model.get("tasks"));
    }
    //send object not literal
    getItems() {
        let queryMessageString = '{"consumeRequest": {"key" : "days", "param": 90, "collectionName": "MovementTasks"}}';
        let qmObject = JSON.parse(queryMessageString);
        window.parent.postMessage(qmObject, "*");
    }

    registerOnMessageReceivedHandler(event) {
        console.log("APP_ENV: incoming data", event);
        if (event.data) {
            console.log("APP_ENV: data received in registerOnMessageReceivedHandler handler", event);
            if(event.data && event.data.hasOwnProperty("save")){

            }
            if(event.data  && event.data.hasOwnProperty("tasks")){
               
                this.model.set({'tasks' : event.data.tasks});
            }
        }
    }
    createGuid(){
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
              (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )
    }
    addToDoItem(el) {
        let title = this.view.get("#todo").value;
        let guid = this.createGuid();
        data.tasks.push({'_id': guid, 'title': title, 'state': "custom" });
        window.parent.postMessage(data, "*");
        this.view.get("#todo").value = '';
    }
    setModelState(el){
        //console.log('remove to do item', el.path.filter((e)=>e.indexOf('li')!==-1));
        let dataset= el.path.filter(e=>e.tagName==='LI')[0].dataset;
        console.log(dataset);
           data.tasks.map(function(value, index, arr){
            if(value._id === dataset.id) {
                value.state = dataset.state;
            }
            return value;
        });
        this.model.set({'tasks': data.tasks});
    }
    
    renderToDoItems() {
        // Click on a close button to hide the current list item
        let model = this.model.get("tasks");
        if(!model) {return; }
        let list = Array.prototype.map.call(model, (item) => {
            let _class = "";
            if (item.state === "deleted") {
                return "";
            }
            if (item.state === "completed") {
                _class = "checked";
            }
            return `<li data-state="${!item.state?"default":item.state}" data-id="${item._id}" class="${_class ? "checked" : ""}">
                        <label class="checkbox-container ${_class}"> 
                            <input type="checkbox" class="${_class ? "checked" : ""}">${item.title}<span class="checkmark"></span> 
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
            listElements[i].onclick =  (e)=> {
                if( e.srcElement.tagName==="SPAN") return;
                //e.preventDefault();
               
              
               let li;
               let input;
               if(e.target.tagName==='LABEL'){
                li = e.srcElement.parentElement;
                input = e.srcElement.children[0];
               }
               if(e.target.tagName==='SPAN'){
                   li = e.srcElement.parentElement.parentElement;
                input = e.srcElement;
               }
               if(e.target.tagName==='INPUT'){
                li = e.srcElement.parentElement.parentElement;
             input = e.srcElement;
            }
               if(e.target.tagName==='LI'){
                   li=e.srcElement;
                   input = li.children[0].children[0];
                  
                  // li.classList.add('checked');
                  
               }
               
               console.log(li, input);
               
               if(input.checked){
                //li["classList"].toggle("checked");
                li.classList.add('checked');
                li.dataset.state ="completed";
               }else{
                li.classList.remove('checked');
                //li["classList"].toggle("checked");
                li.dataset.state ="default";
               }
               
                // if(li["classList"].contains("checked")){
                //     li["classList"].toggle("checked");
                //     li.dataset.state ="completed";
                //     input.checked=true;
                // }else{
                //     li["classList"].toggle("checked");
                //     li.dataset.state ="default";
                //     input.checked=false;
                // }
                   
                this.setModelState(e);
            };
        }
    }
};

