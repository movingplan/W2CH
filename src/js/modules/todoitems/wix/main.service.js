import wixUsers from 'wix-users';
import { RepositoryFactory } from 'public/todoitems/repository/repositoryfactory.js'
import { local } from 'wix-storage';
import wixLocation from 'wix-location';

export class MainService {
    constructor(days) {
        if (!days) {
            throw new Error("Days param were not provided....")
        }
        this.days = days;
        this.repository = RepositoryFactory.get(days);
        this.key = `tasks_${days}_${days_after_move}`;
    }
    async setMoveDate (moveDate){
        try {
            let user = wixUsers.currentUser;
            let email = await user.getEmail();
            if(email){
             return await this.repository.setMoveDate({email, moveDate});
            }
        } catch (e) {
            console.log(`an err was issued ${err.message} ${err.stack}`);
        }
      
    }
    async get(){
        let key = this.key;
        return await this.repository.get(key);
    }
    async save (toSave){
        let user = wixUsers.currentUser;
        let email = await user.getEmail();
        if(email) {
           let key = this.key;
            let toSave = {tasks: toSave.tasks, email, key};
            return await this.repository.save(toSave);
        }
        return await this.repository.save(toSave);
    }
    async approveUser(query) {
        if (query.token) {
            let userForApproval = await this.repository.getUserForApproval({ token: query.token });
            if (await userNotApproved(userForApproval, token)) {
                userForApproval.registrationConfirmation = true;
                return await this.repository.approveUser ( userForApproval );
            }
        }
        async function userNotApproved(userForApproval, token) {
            return userForApproval.length === 1 && userForApproval.token === token && userForApproval.reqistrationConfirmation === false;
        }
    }
    
    async getLocalTasks (email)  {
        async function getcheckListFromLocal(email) {
            let res = this.repository.getAllPredefinedTasks();
            if (res.items.length > 0) {
                let keys = new Set(res.items.map(item => `tasks_${item.days}_${item.days_after_move}`));
                let arr = [...keys];
                let toSave = arr.map(key => {
                    return {
                        email,
                        key,
                        tasks: local.getItem(key)
                    }
                })
                return await toSave.filter(item => item.tasks !== null);
            }
        }
        if (!email) {
            throw new Error("Email was not defined");
        }
        let items = await getcheckListFromLocal(email);
        if (items.length > 0) {
            return await items;
        }

    }

    async registerForApprovalAndTransfer(user) {
        try {
            let email = await user.getEmail();
            let toSave = await this.getLocalTasks(email);
            await this.repository.registerForApproval({ 'token': user.id, 'email': email });
            await this.repository.transfer(toSave);
            //return await this.repositoryLocal.clearAll();
        } catch (err) {
            console.log(`an err was issued ${err.message} ${err.stack}`);
        }

    }


}
