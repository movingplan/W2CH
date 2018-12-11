import * as app from "../../lib/app";
import Model from "./model"
import View from "./view"
import Controller from "./controller"

"use strict"

/*
  Example module
*/
export default class {

    constructor() {
        return app.add("ToDoForm", Model, View, Controller);
    }

};
