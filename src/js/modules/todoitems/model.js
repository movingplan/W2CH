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
       
        this.on('change', (e) => {
            //console.log('model changed from base model: ', e);
        });
        this.sanitize = props => {
            for (const p in props) {
                if (props.hasOwnProperty(p) && typeof props[p] === "string") {
                    props[p] = props[p].replace(/[^\w\s'!.,;]/g, '');
                }
            }
            return props;
        }

        this.on('setPre', props => this.sanitize(props));
       
        this.set({'tasks': {}});
      
    }

};
