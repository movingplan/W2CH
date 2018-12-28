import * as app from "../../lib/app";
import Model from "./model"
import View from "./view"
import Controller from "./controller"

"use strict"

export default class {

    constructor() {
        return app.add("ToDoItems", Model, View, Controller);
    }

};
