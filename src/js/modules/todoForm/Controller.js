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
            let todo = this.model.get('todo');
            if (todo) {
                todo = `<div>${todo}</div>`;
            }
            this.view.get('.debugArea').innerHTML = todo;
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
            }

        });
    }

};
