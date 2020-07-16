const sinon = require('sinon');
const assert = require('assert');
const {expect} = require('chai');
const timeSheetRepo = require('../repositories/timeSheetRepo.js');
const timeSheetService = require('../services/timeSheetService.js');
require('moment')().format('YYYY-MM-DD HH:mm:ss');
const moment = require('moment');
const nock = require('nock');
const TimeSheet = require('../domain/entity/timeSheet');
const Relationship = require('../domain/entity/relationship.js');

const timeSheetBasic1 = {
    id: 1, maker_id: 1, client_id: 'a', hourly_rate: 20.00, start_time: '2019-04-24 22:22:22',
    end_time: '0000-00-00 00:00:00', task: 'worker', admin_note: 'No details given.', relationship_id: 1
};
const timeSheetBasic2 = {
    id: 2, maker_id: 1, client_id: 'b', hourly_rate: 20.00, start_time: '2019-04-23 22:22:22',
    end_time: '2019-04-23 23:23:23', task: 'worker', admin_note: 'Added by admin: 1', relationship_id: 2
};
const timeSheetBasic3 = {
    id: 3, maker_id: 2, client_id: 'a', hourly_rate: 20.00, start_time: '2019-04-22 22:22:22',
    end_time: '2019-04-22 23:23:23', task: 'worker', admin_note: 'Added by admin: 2', relationship_id: 3
};
const timeSheetBasic4 = {
    id: 4, maker_id: 5, client_id: 'a', hourly_rate: 20.00, start_time: '2019-04-22 22:22:22',
    end_time: '0000-00-00 00:00:00', task: 'worker', admin_note: 'Added by admin: 2', relationship_id: 4
};

const timeSheetRefined1 = new TimeSheet(1, 1, 20.00, 'a', '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker', 'No details given.', 1);
const timeSheetRefined2 = new TimeSheet(2, 1, 20.00, 'b', '2019-04-23 22:22:22', '2019-04-23 23:23:23', 'worker', 'Added by admin: 1', 2);
const timeSheetRefined3 = new TimeSheet(3, 2, 20.00, 'a', '2019-04-22 22:22:22', '2019-04-22 23:23:23', 'worker', 'Added by admin: 2', 3);
const timeSheetRefined4 = new TimeSheet(4, 5, 20.00, 'a', '2019-04-22 22:22:22', '0000-00-00 00:00:00', 'worker', 'Added by admin: 2', 4);
const timeSheetRefined4Closed = new TimeSheet(4, 5, 20.00, 'a', '2019-04-22 22:22:22', '2000-01-01 12:00:00', 'worker', 'Added by admin: 2', 4);
const relationship = new Relationship(1, 1, "1", "1", "1", 1);
const firstStart = moment().year(2000);
const secondStart = moment().year(2005);
const thirdStart = moment().year(2010);

describe('Time Clock Service Test', function () {
    beforeEach(function () {
        let scope = nock(process.env.TWINBEE_URL)
            .post('/api/getMakerIdByToken', {auth: process.env.TWINBEE_MASTER_AUTH, token: "asdf"})
            .reply(200,
                JSON.stringify({id: 5})
            );
        let scope5 = nock(process.env.TWINBEE_URL)
            .post('/api/updateClientTimeBucket', {auth: process.env.TWINBEE_MASTER_AUTH, token: "asdf"})
            .reply(200,
                JSON.stringify({id: true})
            );
        let scope2 = nock(process.env.TWINBEE_URL)
            .post('/api/getRelationshipById', {auth: process.env.TWINBEE_MASTER_AUTH, id: 5})
            .reply(200,
                JSON.stringify({id: 5, makerId: 5, clientId: 5, planId: "potato"})
            );
        let scope3 = nock(process.env.TWINBEE_URL)
            .post('/api/getTimeSheetsByMakerId', {auth: process.env.TWINBEE_MASTER_AUTH, id: 5})
            .reply(200,
                JSON.stringify([{
                    id: 5,
                    maker_id: 5,
                    client_id: 5,
                    hourly_rate: "potato",
                    timeIn: '2019-04-22 22:22:22',
                    timeOut: '2019-04-22 23:23:23',
                    task: 'worker',
                    admin_note: 'Added by admin: 2'
                }])
            );
        let scope4 = nock(process.env.TWINBEE_URL)
            .post('/api/createTimeSheet'
            )
            .reply(200,
                JSON.stringify({id: 1})
            );
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should clock in a user', async () => {
        let onlinesheetsstub = sinon.stub(timeSheetService, 'getOnlineSheets')
            .resolves([]);
        let sendStub = sinon.stub(timeSheetRepo, 'updateSheet')
            .resolves();
        let getStub = sinon.stub(timeSheetRepo, "getTimeSheet")
            .withArgs(4)
            .resolves(timeSheetRefined4Closed);
        let results = await timeSheetService.clockIn("asdf", "asdf", "5");
        expect(results).to.equal(true);
    });

    it('Should clock out a user', async function () {
        let onlinesheetsstub = sinon.stub(timeSheetService, 'getOnlineSheets')
            .resolves([timeSheetRefined4]);
        let actual = await timeSheetService.clockOut("asdf");

        expect(actual).to.equal(true);
    });
});

describe("Open Sheet Test", function () {
    beforeEach(function () {
        let createSheetStub = sinon.stub(timeSheetService, 'createTimeSheet')
            .callsFake(function (makerId, planId, clientId, startTime, endTime, task, detail, relationshipId) {
                return new Promise((resolve, reject) => {
                    let newSheet = new TimeSheet(1, makerId, planId, clientId, startTime, endTime, task, detail, relationshipId);
                    resolve(newSheet);
                })
            });
    });

    afterEach(function () {
        sinon.restore();
    });


    it('Should open a new sheet', async function () {
        let startMoment = moment();
        let actual = await timeSheetService.openTimeSheet(relationship, startMoment, "task");
        expect(actual).to.deep.equal(new TimeSheet(1, 1, "1", "1", moment(startMoment).format('YYYY-MM-DD HH:mm:ss'), "0000-00-00 00:00:00", "task", "Created Normally", 1));
    });
})

describe("Close Sheet Test", function () {
    beforeEach(function () {
        let createSheetStub = sinon.stub(timeSheetService, 'updateTimesheet')
            .callsFake(function (id, planId, startTime, endTime, task, detail) {
                return new Promise((resolve, reject) => {
                    let newSheet = new TimeSheet(id, 2, planId, 4, startTime, endTime, task, detail, 1);
                    resolve(newSheet);
                })
            });
    });

    afterEach(function () {
        sinon.restore();
    });


    it('Should close the selected sheet', async function () {
        let startMoment = moment();
        let endMoment = moment();
        let actual = await timeSheetService.closeTimeSheet(new TimeSheet(1, 2, 3, 4, moment(startMoment).format('YYYY-MM-DD HH:mm:ss'), "0000-00-00 00:00:00", "task", "note", 1),
            endMoment, "newTask");
        expect(actual).to.deep.equal(new TimeSheet(1, 2, 3, 4, moment(startMoment).format('YYYY-MM-DD HH:mm:ss'), moment(endMoment).format('YYYY-MM-DD HH:mm:ss'), "newTask", "note", 1));
    });
})

describe("Last Online Sheet Test", function () {
    beforeEach(function () {
        let onlineSheetsStub = sinon.stub(timeSheetService, 'getOnlineSheets')
            .callsFake(function (id) {
                return new Promise((resolve, reject) => {
                    let sheets = [
                        new TimeSheet(id, 2, 1, 4, moment(firstStart).format("YYYY-MM-DD HH:mm:ss"), "0000-00-00 00:00:00", "task", "detail", 1),
                        new TimeSheet(id, 2, 1, 4, moment(secondStart).format("YYYY-MM-DD HH:mm:ss"), "0000-00-00 00:00:00", "task", "detail", 1),
                        new TimeSheet(id, 2, 1, 4, moment(thirdStart).format("YYYY-MM-DD HH:mm:ss"), "0000-00-00 00:00:00", "task", "detail", 1)
                    ];
                    resolve(sheets);
                })
            });
        let secondsOnlineStub = sinon.stub(timeSheetService, 'getSecondsSince')
            .callsFake(function (id) {
                return new Promise((resolve, reject) => {
                    resolve(5);
                })
            });
    });


    afterEach(function () {
        sinon.restore();
    });


    it('Should successfully grab the most recent online sheet', async function () {
        let actual = await timeSheetService.getLastOnlineSheet(1);
        let expectedSheet = new TimeSheet(1, 2, 1, 4, moment(thirdStart).format("YYYY-MM-DD HH:mm:ss"), "0000-00-00 00:00:00", "task", "detail", 1);
        expectedSheet.secondsOnline = 5;
        expect(actual).to.deep.equal(expectedSheet);
    });
});

describe("Token Relationship Validation Test", function () {
    beforeEach(function () {

        let tokenScope = nock(process.env.TWINBEE_URL)
            .post('/api/getMakerIdByToken', {auth: process.env.TWINBEE_MASTER_AUTH, token: "fakeToken"})
            .reply(200,
                JSON.stringify({id: 5})
            );
    });


    afterEach(function () {
        sinon.restore();
    });


    it('Should pass validation', async function () {
        let actual = await timeSheetService.tokenIsInSheetRelationship("fakeToken", new Relationship(1, 5, 1, 1, 1));
        expect(actual).to.equal(true);
    });

    it('Should fail validation', async function () {
        let actual = await timeSheetService.tokenIsInSheetRelationship("fakeToken", new Relationship(1, 1, 1, 1, 1));
        expect(actual).to.equal(false);
    });
});


describe('Time Sheet Service Test', function () {
    beforeEach(function () {
        let getAllSheetsStub = sinon.stub(timeSheetRepo, 'getAllSheets')
            .resolves([timeSheetBasic1, timeSheetBasic2, timeSheetBasic3]);
        let getByMakerStub = sinon.stub(timeSheetRepo, 'getSheetsByMaker')
            .withArgs(1)
            .resolves([timeSheetBasic1, timeSheetBasic2])
            .withArgs(-1)
            .resolves([]);
        let getByClientStub = sinon.stub(timeSheetRepo, 'getSheetsByClient')
            .withArgs('a')
            .resolves([timeSheetBasic1, timeSheetBasic3])
            .withArgs(-1)
            .resolves([]);
        let createSheetStub = sinon.stub(timeSheetRepo, 'createSheet')
            .resolves(1);
        let deleteSheetStub = sinon.stub(timeSheetRepo, 'clearSheet')
            .resolves(() => {
                console.log("Don't delete me bro!");
            });
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should mark a sheet as deleted', async function () {
        await timeSheetService.clearTimeSheet(25);
        sinon.assert.calledOnce(timeSheetRepo.clearSheet);
    });

    it('Should not mark a sheet as deleted', async function () {
        await timeSheetService.clearTimeSheet(null);
        sinon.assert.notCalled(timeSheetRepo.clearSheet);
    });

    it('Should grab only the sheets for online users', async function () {
        let actual = await timeSheetService.getOnlineMakerSheets();
        expect(actual).to.deep.equal([timeSheetRefined1]);

    });

    it('Should grab all sheets for a given maker', async function () {
        let actual = await timeSheetService.getSheetsByMaker(1);
        expect(actual).to.deep.equal([timeSheetRefined1, timeSheetRefined2]);
    });

    it('Should fail to find sheets for a nonexistent maker', async function () {
        let actual = await timeSheetService.getSheetsByMaker(-1);
        expect(actual).to.deep.equal([]);
    });

    it('Should fail to find sheets for a nonexistent maker', async function () {
        let actual = await timeSheetService.getSheetsByMaker(null);
        expect(actual).to.deep.equal([]);
    });

    it('Should grab all sheets for a given client', async function () {
        let actual = await timeSheetService.getSheetsByClient('a');
        expect(actual).to.deep.equal([timeSheetRefined1, timeSheetRefined3]);
    });

    it('Should fail to find sheets for a nonexistent client', async function () {
        let actual = await timeSheetService.getSheetsByClient(-1);
        expect(actual).to.deep.equal([]);
    });


    it('Should grab  all timesheets', async function () {
        let actual = await timeSheetService.getAllTimeSheets();
        expect(actual).to.deep.equal([timeSheetRefined1, timeSheetRefined2, timeSheetRefined3]);
    });

    it('Should create a new valid timesheet', async function () {
        let actual = await timeSheetService.createTimeSheet(1, 20.00, 'a', '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker', "No details given.", 1);
        expect(actual).to.deep.equal(timeSheetRefined1);
        sinon.assert.calledOnce(timeSheetRepo.createSheet);
    });
    it('Should fail to create a timesheet without a maker id', async function () {
        let actual = await timeSheetService.createTimeSheet(null, 20.00, 'a', '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker', "No details given.", 1);
        expect(actual).to.deep.equal({status: "failed to create timesheet\n", reason: "makerId was invalid\n"});
    });
    it('Should fail to create a timesheet without a plan id', async function () {
        let actual = await timeSheetService.createTimeSheet(1, null, 'a', '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker', "No details given.", 1);
        expect(actual).to.deep.equal({status: "failed to create timesheet\n", reason: "planId was invalid\n"});
    });
    it('Should fail to create a timesheet without a client id', async function () {
        let actual = await timeSheetService.createTimeSheet(1, 20.00, null, '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker', "No details given.", 1);
        expect(actual).to.deep.equal({status: "failed to create timesheet\n", reason: "clientId was invalid\n"});
    });
    it('Should fail to create a timesheet without a time in', async function () {
        let actual = await timeSheetService.createTimeSheet(1, 20.00, 'a', null, '0000-00-00 00:00:00', 'worker', "No details given.", 1);
        expect(actual).to.deep.equal({status: "failed to create timesheet\n", reason: "timeIn was invalid\n"});
    });
    it('Should fail to create a timesheet without a time out', async function () {
        let actual = await timeSheetService.createTimeSheet(1, 20.00, 'a', '2019-04-24 22:22:22', null, 'worker', "No details given.", 1);
        expect(actual).to.deep.equal({status: "failed to create timesheet\n", reason: "timeOut was invalid\n"});
    });
    it('Should fail to create a timesheet without multiple required fields', async function () {
        let actual = await timeSheetService.createTimeSheet(null, null, null, null, '0000-00-00 00:00:00', 'worker', "No details given.", 1);
        expect(actual).to.deep.equal({
            status: "failed to create timesheet\n",
            reason: "makerId was invalid\nplanId was invalid\nclientId was invalid\ntimeIn was invalid\n"
        });
    });

});