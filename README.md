
### Set up  
Install: `npm install`  
Build: `gulp` *(or `gulp dev`/`gulp prod`)*  
Test: `npm test`  
Run: `dist/index.html`  


### Example syntax  
*todoForm/ToDoForm.js 
```javascript
import * as app from "../../lib/app";
import Model from "./Model"
import View from "./View"
import Controller from "./Controller"

"use strict"

/*
  Example module
*/
export default class {

    constructor() {
        return app.add("toDoForm", Model, View, Controller);
    }

};
```

*toDoForm/Model.js*
```javascript
import * as app from "../../lib/app";

"use strict"

/*
  Extends app.Model
      Methods: `set()`, `get()`, `on('setPre'|'setPost'|'change')`
*/
export default class extends app.Model {

    constructor() {
        super();

        // Arbitrary method
        this.sanitize = props => {
            for (const p in props) {
                if (props.hasOwnProperty(p) && typeof props[p] === "string") {
                    props[p] = props[p].replace(/[^\w\s'!.,;]/g, '');
                }
            }
            return props;
        }

        // Set listener
        this.on('setPre', props => this.sanitize(props));

        // Populate model
        this.set({
            comment: '',
            date: Date.now()
        });

        // Set by path
        this.set('user.name', 'Guest');
    }

};
```

*todoForm/View.js*
```javascript
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
        this.el = document.getElementById("todoform");
    }

};
```

*todoForm/Controller.js*
```javascript
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
            this.view.get('.todosection').innerHTML = todo;
        });

        // Example 2 way bindings
        this.bind({

            '#name': (el, model, view, controller) => {
                el.onkeyup = () => {
                    model.set('user.name', el.value);
                }
                model.on('setPost', () => {
                    el.value = model.get('user.name');
                });
            },

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
```