
export default class  {
    constructor (type){

        if(type === 'init'){
            this.message = 'init';
        }
        if( type === 'get' ){
           this.message =  { "consumeData": {"key" : "days", "param": 90, "collectionName": "MovementTasks"}};
        }
        
        this.message = msg;
    }
    toJSON(){
        return JSON.stringify(this);
    }
   
    get(){
        return this.message;
    }
}