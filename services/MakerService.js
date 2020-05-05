const makerRepo = require('../repositories/makerRepo.js');
const Maker = require('../domain/entity/maker.js');
//id, name, location, remainingHours, email, chargebeeObj, makers)
class MakerService {
    constructor(){};
    //TODO: handle chargebee, maker integration
    async getAllMakers(){
        let makers = [];
        let repoResult = await makerRepo.getAllMakers();
        repoResult.forEach(item => {
            let newObj = new Maker(item.id, item.first_name, item.last_name, item.email);

            makers.push(newObj);
        })
        return makers;
    }

    async createMaker(id, firstName, lastName, email){
        return new Maker(id, firstName, lastName, email);
    }

    async getOnlineMakers() {
        let onliners = [];
        let retrieved = await makerRepo.getOnlineMakers();
        retrieved.forEach(item => {
            let online = new Maker(item.maker_id, item.first_name, item.last_name, item.email);
            onliners.push(online);
        })
        return onliners;
    }

    /**
     * Retrieves all time sheets for a given maker.
     * @param id    - id of the desired maker
     * @returns {Promise<[]>} containing time_sheet objects
     */
    async getSheetsByMaker(id){
        let sheets = [];

        return sheets;
    }

    async getClientListForMakerId(id){

        let clients = [];

        /*
         */





        return [];
    }

    async getChargebeeObjectForId(id){
        return null;
    }

    async getMakerById(id){
        let makers = await  this.getAllMakers();
        for (var i = 0; i < makers.length; ++i){
            if (makers[i].id == id)
                return new Maker(makers[i].id, makers[i].firstName, makers[i].lastName,
                    makers[i].email);
        }
        return 'not found';
    }


}

module.exports = new MakerService();