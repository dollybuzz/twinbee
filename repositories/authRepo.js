const {query} = require('./repoMaster');
const repoMaster = require('./repoMaster.js');
const notificationService = require('../services/notificationService.js');
class AuthRepository {
    constructor() {
    };

    async getAdmins(numRetries) {
        if (!numRetries){
            numRetries = 3;
        }
        return new Promise(async (resolve, reject)=>{
            let sql = 'SELECT * FROM admin';
            let sqlParam = [];
            let result;
            result = await query(sql, sqlParam).catch( async e => {
                console.log(e);
                result = [];
                notificationService.notifyAdmin(e.toString());
                await repoMaster.activateConnection(repoMaster, 3);
                console.log(`Trying to get admin again, ${numRetries} retries left`);
                resolve(await this.getAdmins(numRetries -1));
            });
            resolve(result);
        });
    }
}

module.exports = new AuthRepository();