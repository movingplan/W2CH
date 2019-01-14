import wixUsers from 'wix-users';
import { RepositoryFactory } from 'public/todoitems/repository/repositoryfactory.js'

export class MainService {
    constructor(days) {
       this.repository = RepositoryFactory.get(days);
    }

    async registerForApprovalAndTransfer() {
        try {
            let register = await this.repository.registerForApproval({ 'token': this.user.id, 'email': this.email });
            let toSave = await JSON.parse(this.repositoryLocal.get());
            await this.repository.save({ email: this.email, tasks: toSave });
        } catch (err) {
            console.log(`an err was issued ${err.message} ${err.stack}`);
        }

    }
}
