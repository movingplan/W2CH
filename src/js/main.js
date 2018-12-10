import Boot from "./modules/Boot/Boot";
import ToDoForm from "./modules/todoForm/ToDoForm";

new Boot()
    .then(() => {
        new ToDoForm();
    });
