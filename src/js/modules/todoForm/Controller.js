import * as app from "../../lib/app";
import * as data   from "../../json/data"
"use strict"

/*
  Extends `app.Controller`
      Properties: `model`, `view`
      Methods: `bind()` for DOM selectors
*/
export default class extends app.Controller {

    constructor() {
        super();

        // Update view when model changes
        this.model.on('change', (e) => {
            console.log('model changed', e);
            this.renderToDoItems();
        });

        // Example 2 way bindings
        this.bind({            
              '#addBtn': (el, model, view, controller) => {
                el.onclick = (e) => {
                    this.addToDoItem();
                    
                }
            }
         
        });
    }
    addToDoItem(el) {
        let title = this.view.get("#todo").value;
        data.tasks.push({'title': title});
        this.renderToDoItems(); 
        console.log('on item added');
        this.view.get("#todo").value= '';
    }
    
    renderToDoItems() {
         // Click on a close button to hide the current list item
        
        let list = Array.prototype.map.call(this.model.get("todos.tasks"), (item) => {
            let _class = "";
            if (item.state === "deleted") {
                return "";
            }
            if (item.state === "completed") {
                _class = "checked";
            }
            return `<li data-state="${item.state}" data-id="${item._id}" class="${_class}">
                        <label class="checkbox-container ${_class}"> 
                            <input type="checkbox" ${_class?"checked":""}>${item.title}<span class="checkmark"></span> 
                        </label><span class="close">×</span>
                    </li>`
        });

        this.view.get("#todolist").innerHTML = list.join("");
        let close =  this.view.getAll(".close");
       
        for (let i = 0; i < close.length; i++) {
            close[i].onclick = function () {
                let li = close[i].parentElement;
                li.style.display = "none";
                li.dataset.state = "deleted";
            };
        }
    }
};

