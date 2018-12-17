## W2CH Todo application

### Set up  
Install: `npm install`  
Build: `gulp` *(or `gulp dev`/`gulp prod`)*  
Run: `dist/index.html`  

### Get latest version of application link
```
$gitver =  git rev-parse HEAD 
"https://min.gitcdn.link/cdn/movingplan/w2ch/" + $gitver + "/dist/index.html"
```

### Example syntax  
*todoitmes/todoitems.js 
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
        return app.add("ToDoItems", Model, View, Controller);
    }

};
```

*todoitems/model.js*
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
            tasks: {}
        });

        // Also set by path possible
        this.set('user.name', 'Guest');
    }

};
```

*todoitems/view.js*
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
        this.el = document.getElementById("todo");
    }

};
```

*todoitems/controller.js*
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
            this.view.get('#todosection').innerHTML = todo;
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

};
```
