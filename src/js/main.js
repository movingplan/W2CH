import Boot from "./modules/boot/boot";
import ToDoItems from "./modules/todoitems/todoitems";

new Boot()
    .then(() => {
        new ToDoItems();
    });
