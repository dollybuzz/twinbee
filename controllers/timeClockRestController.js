const timeClockService = require('../services/timeClockService.js');

module.exports = {

    /**
     * "Clocks in" a given user. Initializes a new timesheet with the provided
     * client, hourly rate, and occupation. Looks for values in the body in the form:
     * {
     *     "makerId": id of maker to clock in,
     *     "hourlyRate": hourly rate of maker to clock in,
     *     "clientId": id of client the maker is working for,
     *     "occupation": type of work performed for this period
     * }
     */
    clockIn: async (req, res) => {
        timeClockService.clockIn(req.body.makerId, req.body.hourlyRate,
            req.body.clientId, req.body.occupation);
        res.end();
    },

    /**
     * "Clocks out" a given user. Commpletes any timesheets without valid "clock in"
     * values (ideally should only ever be one) with the current time. Looks for
     * values in the body in the form:
     * {
     *     "makerId": id of the maker to clock out
     * }
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    clockOut: async (req, res) => {
        timeClockService.clockOut(req.body.makerId);
        res.end();
    }
}