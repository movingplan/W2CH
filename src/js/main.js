import Boot from "./modules/boot/boot";
import ToDoForm from "./modules/todoForm/todoform";

new Boot()
    .then(() => {
        new ToDoForm();
    });
