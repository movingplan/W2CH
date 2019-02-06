export default class ToDoViewModel  {

    constructor(days, title, state) {
        this._id = this.createGuid();
        this.days = days.days;
        this.days_after_move = days.days_after_move;
        this.title = title;
        this.state = state;
        this.order = 0;
    }
    createGuid() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }


}