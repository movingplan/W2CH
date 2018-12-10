import * as app from "../../lib/app";

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
        this.model.on('change', () => {
            let todos = this.renderToDoItems();
            this.view.get('#todolist').innerHTML = todos;
        });

        // Example 2 way bindings
        this.bind({
            '#todo': (el, model, view, controller) => {
                el.onkeyup = () => {
                    model.set('todo', el.value);
                }
                model.on('setPost', () => {
                    el.value = model.get('todo');
                });
            },
            '#addBtn': (el, model, view, controller) => {
                el.onclick = (e) => {
                    this.addToDoItem(e);
                };
            }

        });
    }
    addToDoItem(el) {
        console.log(el.value)
    }
    renderToDoItems() {
        let list = Array.prototype.map.call(this.model.get("todos.tasks"), (o) => {
            return `<li data-state="custom"><label class="checkbox-container" >
        <input type="checkbox">${o.title}<span class="checkmark"></span>  </label><span class="close">×</span></li>`
        }).join("");;
        return list;
    }

};