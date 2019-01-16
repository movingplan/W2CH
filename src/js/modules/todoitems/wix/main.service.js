import wixUsers from 'wix-users';
import { RepositoryFactory } from 'public/todoitems/repository/repositoryfactory.js'

export class MainService {
    constructor(days) {
        if(!days){
            throw new Error("Days param were not provided....")
        }
        this.days = days;
		this.repository =  RepositoryFactory.get(days);
    }
    async registerForApprovalAndTransfer(user) {
        try {
            let email = await user.getEmail();
            await this.repository.registerForApproval({ 'token': user.id, 'email': email });
            let toSave = await JSON.parse(this.repository.get());
            await this.repository.transfer({ email: email, tasks: toSave });
            return await this.repositoryLocal.clearAll();
        } catch (err) {
            console.log(`an err was issued ${err.message} ${err.stack}`);
        }

    }

    
}
