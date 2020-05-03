const clientService = require('../services/ClientService.js');


//TODO Add validation before action
module.exports = {
    getClientById: async (req, res) => {
        let id = req.query.id;
        let client = clientService.getClientById(id);
        res.send(client);
    },

    createClient: (req, res) =>{

        //TODO integrate chargebee and makers
        let chargebeeObj = null;
        let makers = null;

        clientService.createClient(req.body.name, req.body.location, req.body.remainingHours,
            req.body.email, chargebeeObj)

    },

    getAllClients: async (req, res) => {
        res.send(await clientService.getAllClients());
    }
}
