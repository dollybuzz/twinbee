const {logCaughtError} = require('../util.js');
const repoMaster = require('./repoMaster.js');

class MakerRepository {
    constructor() {
    };

    async createMaker(firstName, lastName, email, unique) {
        if (!unique) {
            unique = "";
        }
        let sql = 'INSERT INTO maker(first_name, last_name, email, unique_descriptor) VALUES (?, ?, ?, ?)';
        let sqlParams = [firstName, lastName, email, unique];
        repoMaster.query(sql, sqlParams, function (err, result) {
            if (err) {logCaughtError(err)}
        });
        console.log(`Maker with last name ${lastName} created`)
    }

    async updateMaker(id, firstName, lastName, email, unique) {
        if (!unique) {
            unique = "";
        }
        let sql = 'UPDATE maker SET first_name = ?, last_name = ?, email = ?, unique_descriptor = ? WHERE id = ?';
        let sqlParams = [firstName, lastName, email, unique, id];
        repoMaster.query(sql, sqlParams, function (err, result) {
            if (err) {logCaughtError(err)}
        });
        console.log(`Maker ${id} updated`);
    }

    deleteMaker(id) {
        let sql = 'UPDATE maker SET deleted = true where id = ?';
        let sqlParams = [id];
        repoMaster.query(sql, sqlParams, function (err, result) {
            if (err) {logCaughtError(err)}
        });
        console.log(`Maker ${id} marked as deleted`);
    }

    async getOnlineMakers() {
        let sql = 'SELECT maker_id, first_name, last_name, maker.email ' +
            'FROM maker ' +
            'JOIN time_sheet ON maker.id = time_sheet.maker_id ' +
            'JOIN client ON time_sheet.client_id = client.chargebee_id ' +
            'WHERE end_time - start_time < 0 ' +
            'GROUP BY maker.id';
        let sqlParams = [];
        let result;
        result = await repoMaster.query(sql, sqlParams).catch(e => {
            logCaughtError(e);
            result = [];
        });
        console.log("Online makers retrieved from database");
        return result;
    }

    async getMakerById(id) {
        let sql = 'SELECT * FROM maker WHERE id = ?';
        let sqlParam = [id];
        let result;
        result = await repoMaster.query(sql, sqlParam).catch(e => {
            logCaughtError(e);
            result = [];
        });
        console.log(`Maker ${id} retrieved from database`);
        return result;
    }

    async getAllMakers(numRetries) {
        if (!numRetries) {
            numRetries = 3;
        }

        return new Promise(async (resolve, reject) => {
            let sql = 'SELECT * FROM maker';
            let sqlParam = [];
            let result;
            result = await repoMaster.query(sql, sqlParam).catch(async e => {
                if (numRetries === 0) {
                    reject();
                }
                result = [];
                logCaughtError(e);
            });
            console.log("All makers retrieved from database");
            resolve(result);
        })
    }

    async getMakerIdByEmail(email) {
        let sql = 'SELECT id FROM maker WHERE email = ? AND deleted = false';
        let sqlParam = [email];
        let result;
        result = await repoMaster.query(sql, sqlParam).catch(e => {
            logCaughtError(e);
            result = [];
        });
        console.log(`Maker ID retrieved for maker with email ${email}`);
        let idToReturn = result[0].id;
        for (var maker of result){
            if (!maker.deleted){
                idToReturn = maker.id;
                break;
            }
        }
        return idToReturn;
    }
}


module.exports = new MakerRepository();