import * as app from "../../lib/app";

"use strict"

/*
  Extends app.View
      Properties: `el`
      Methods: `get()`, `getAll()` for DOM selectors
*/
export default class extends app.View {

    constructor() {
        super();
       
        // Set DOM ref
        this.el = document.getElementById("todosection");
        this.title= document.querySelector("h2-title");
    }
    setTitle (days){
        let title;
        if(days.days ===90  && days.days_after_move ===0){
            title = `3 Monate vor dem Umzug`;
        }
        if(days.days ===30  && days.days_after_move ===0){
            title = `1 Monat vor dem Umzug`;
        }
        if(days.days ===14  && days.days_after_move ===0){
            title = `2 Wochen vor dem Umzug`;
        }
        if(days.days ===1  && days.days_after_move ===0){
            title = `1 Tag vor dem Umzug`;
        }
        if(days.days ===0  && days.days_after_move ===0){
            title = `Am Umzugstag`;
        }

        if(days.days ===0  && days.days_after_move ===14){
            title = `Bis 14 Tage nach dem Umzug`;
        }
        if(days.days ===0  && days.days_after_move ===90){
            title = `Bis 3 Monate nach dem Umzug`;
        }
        if(days.days ===0  && days.days_after_move ==300){
            title = `Bis 12 Monate nach dem Umzug`;
        }

        this.title.innerHTML = title;
    }
    
    renderToDoItems(todos) {
        // Click on a close button to hide the current list item
        
        if (!todos) { return; }
        if(todos.days) {
            this.get('.h2-title').innerHTML = `${todos.days} days before move`;
        }
        let list = Array.prototype.map.call(todos, (item) => {
            let _class = "";
            if (item.state === "deleted") {
                return "";
            }
            if (item.state === "completed") {
                _class = "checked";
            }
            return `<li data-state="${!item.state ? "default" : item.state}" data-id="${item._id}" class="${_class ? "checked" : ""}">
                        <label class="checkbox-container ${_class}"> 
                            <input type="checkbox" ${_class ? "checked" : ""} class="${_class ? "checked" : ""}"><span class="todo-item-title">${item.title}</span><span class="checkmark"></span> 
                        </label><span class="close">×</span>
                    </li>`
        });

        this.get("#todolist").innerHTML = list.join("");
        this.el = document.getElementById("todosection");
       
    }
};
