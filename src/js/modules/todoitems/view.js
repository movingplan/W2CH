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
        this.title = document.querySelector(".h2-title");
        this.setModal();
    }
    setModal() {
        this.modal = $('#todoModal');
        this.modal.modal('hide');

    }

    removeItem(e) {
        e.preventDefault();
        let li = e.target.parentElement;
        li.style.display = "none";
        li.dataset.state = "deleted";
        return li.dataset;
    }

    addItem(item) {
        this.list = document.querySelector("#todolist");
        var wrapper = document.createElement('div');
        wrapper.innerHTML = this.renderToDoItem(item);
        var li = wrapper.firstChild;

        if (this.list.childNodes[0]) {
            this.list.insertBefore(li, this.list.childNodes[0]);
        } else {
            this.list.appendChild(li);
        }
    }

    info (title, message) {

        this.modal.find('#todoModalCenterTitle').html(title);
        this.modal.find('#message').html(message);
        this.modal.find('.modal-footer').hide();
        setTimeout(() => {
            this.modal.modal("hide");
        }, 3000);
        this.modal.modal('show');
}
    confirm(title, message, yescallBack, nocallBack, source) {

        this.modal.find('#todoModalCenterTitle').html(title);
        this.modal.find('#message').html(message);
        this.modal.find('.modal-footer').show();
        this.modal.on('click', '#confirm', (e) => {
            this.modal.modal("hide");
            this.modal.on("hidden.bs.modal", yescallBack(this.removeItem(source)));
        });
        this.modal.modal('show');
}

setTitle(days) {
    if (!days) return;
    //console.log(`days ${JSON.stringify(days)}`);
    let title = `3 Monate vor dem Umzug`;
    if (days.days === 90 && days.days_after_move === 0) {
        title = `3 Monate vor dem Umzug`;
    }
    if (days.days === 30 && days.days_after_move === 0) {
        title = `1 Monat vor dem Umzug`;
    }
    if (days.days === 14 && days.days_after_move === 0) {
        title = `2 Wochen vor dem Umzug`;
    }
    if (days.days === 1 && days.days_after_move === 0) {
        title = `1 Tag vor dem Umzug`;
    }
    if (days.days === 0 && days.days_after_move === 0) {
        title = `Am Umzugstag`;
    }
    if (days.days === 0 && days.days_after_move === 14) {
        title = `Bis 14 Tage nach dem Umzug`;
    }
    if (days.days === 0 && days.days_after_move === 90) {
        title = `Bis 3 Monate nach dem Umzug`;
    }
    if (days.days === 0 && days.days_after_move == 300) {
        title = `Bis 12 Monate nach dem Umzug`;
    }

    this.get(".h2-title").innerHTML = title;
}

renderToDoItems(todos) {
    // Click on a close button to hide the current list item

    if (!todos) { return; }
    if (todos.days) {
        this.get('.h2-title').innerHTML = `${todos.days} days before move`;
    }
    let list = Array.prototype.map.call(todos, (item) => {
        if (item.state !== "deleted") {
            return this.renderToDoItem(item)
        }
    });

    this.get("#todolist").innerHTML = list.join("");
}


renderToDoItem(item) {
    let checked = item.state === "completed" ? "checked" : "";
    return `<li data-state="${!item.state ? "default" : item.state}" data-id="${item._id}" class="${checked}">
                    <label class="checkbox-container ${checked}"> 
                        <input type="checkbox" ${checked} class="${checked}">
                        <span class="todo-item-title">${item.title}</span><span class="checkmark"></span> 
                    </label>
                    <span class="close">×</span>
                </li>`;
}

}