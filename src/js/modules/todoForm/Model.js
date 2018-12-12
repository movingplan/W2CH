import * as app from "../../lib/app";
import * as tasks   from "../../json/data"
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
        this.on('change', (e) => {
            console.log('model changed: ', e);
            this.renderToDoItems();
        });
        this.set({'tasks': {}});
        // Set by path
       // this.set('user.name', 'Guest');
    }

};
