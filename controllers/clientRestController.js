const clientRepo = require('../repositories/clientRepo.js');
const clientService = require('../services/ClientService.js');

module.exports = {
    getClientById: async (req, res) => {
        console.log(req);
        let id = req.query.id;
        let clients = await clientRepo.getAllClients();

        for (var i = 0; i < clients.length; ++i) {
            if (clients[i].id == id) {
                let client = await clientService.createClient(clients[i].id, clients[i].name, clients[i].remaining_hours,
                    clients[i].email, null, null);
                res.send(client);
            }
        }
    }
}