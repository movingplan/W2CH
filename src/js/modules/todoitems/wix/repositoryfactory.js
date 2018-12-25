import { CheckListRepository, CheckListRepositoryLocal } from "public/todoitems/repository/checklists.js";

export class RepositoryFactory {
    constructor(name) {
        this.name = name;
        this.repositories = [
            { name: "checkList", source: () => new CheckListRepository() },
            { name: "checkListLocal", source: (key) => new CheckListRepositoryLocal(key) }
        ];
        let fn = this.repositories.filter(function (repo) {
            if (repo.name === name) {
                return repo.source;
            }
        });
        if (fn.length !== 1) {
            throw new Error(`There is no repository ${this.name}!`);
        }
        this.repository = fn[0].source;
    }
    get(params) {
        return this.repository(params);
    }

}