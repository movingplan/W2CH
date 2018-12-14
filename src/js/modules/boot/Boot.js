/*
  Boot operations
*/
export default class {

    constructor() {
        return this.ready();
    }

    ready() {
        return new Promise((resolve, reject) => {
            document.addEventListener("DOMContentLoaded", () => {
                // let initData = {
                //     get: "Y"
                // };
               // console.log('APP_ENV: sending to wix:', initData)
               // window.parent.postMessage(initData, "*");
                // Just a dummy condition
                if (/\w/.test(location.href)) {
                    resolve();
                }
                else reject('Error');
            });
        });
    }
    

};
