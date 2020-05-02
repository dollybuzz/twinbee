const makerRepo = require('../repositories/makerRepo.js');
const makerService = require('../services/makerService.js');

module.exports ={
    getMakerById: async (req, res)=>{
        console.log(req)
        let id = req.query.id;
        let maker = await makerRepo.getMakerById(id);

        if(maker.id == id)
        {
            let maker = await makerService.createMaker(maker.id, maker.firstName, maker.lastName, maker.email,
                maker.chargebeeObj, maker.clients);
            res.send(maker);
        }

    }
}