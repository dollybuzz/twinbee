const sinon = require('sinon');
const {expect} = require('chai');
const nock = require('nock');
const reportingService = require('../services/timeReportingService.js');
const emailService = require("../services/notificationService.js");
const TimeSheet = require('../domain/entity/timeSheet');

const timeSheetRefined1 = new TimeSheet(1, 1, 20.00, 'a', '2019-04-24 22:22:22', '0000-00-00 00:00:00', 'worker', 'No details given.', 1);
const timeSheetRefined2 = new TimeSheet(2, 1, 20.00, 'b', '2019-04-23 22:00:00', '2019-04-23 23:00:00', 'worker', 'Added by admin: 1', 2);
const timeSheetRefined3 = new TimeSheet(3, 2, 20.00, 'a', '2019-04-22 22:00:00', '2019-04-22 23:00:00', 'worker', 'Added by admin: 2', 3);
const timeSheetRefined4 = new TimeSheet(4, 5, 20.00, 'a', '2019-04-22 22:00:00', '0000-00-00 00:00:00', 'worker', 'Added by admin: 2', 4);


describe('Get Sheet Details Test', function () {

    beforeEach(function () {

        reportingService.clientMap = {
            "1": {
                id: "1",
                first_name: "clientFirst1",
                last_name: "clientLast1",
                company: "clientCompany1"
            },
            "2": {
                id: "2",
                first_name: "clientFirst2",
                last_name: "clientLast2",
            }
        };
        reportingService.makerMap = {
            "1": {
                id: "1",
                firstName: "makerFirst1",
                lastName: "makerLast1"
            },
            "2": {
                id: "2",
                firstName: "makerFirst2",
                lastName: "makerLast2",
            }
        }
    });

    afterEach(function () {
        sinon.restore();
    });


    it('Should successfully grab the sheet details normally', async function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true)
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: 1,
                planId: "asdf",
                clientId: 1,
                timeIn: "2020-01-01 01:00:00",
                timeOut: "2020-01-01 02:00:00",
                task: "some task",
                adminNote: "created normally",
                relationshipId: 4
            }
        );
        expect(actual).to.deep.equal({
            duration: 60,
            clientName: "clientFirst1 clientLast1",
            clientCompany: "clientCompany1",
            makerName: "makerFirst1 makerLast1"
        });
    });


    it('Should successfully indicate a deleted sheet', async function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true)
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: 1,
                planId: "asdf",
                clientId: 1,
                timeIn: "00:00:00",
                timeOut: "00:00:00",
                task: "some task",
                adminNote: "deleted",
                relationshipId: 4
            }
        );
        expect(actual).to.deep.equal(
            {
                duration: 0,
                clientName: "Deleted Sheet",
                clientCompany: "Deleted Sheet",
                makerName: "Deleted Sheet"
            }
        );
    });

    it('Should successfully grab the sheet details with a deleted client', async function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true)
        let clientId = 5;
        let makerId = 1
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: makerId,
                planId: "asdf",
                clientId: clientId,
                timeIn: "2020-01-01 01:00:00",
                timeOut: "2020-01-01 02:00:00",
                task: "some task",
                adminNote: "created normally",
                relationshipId: 4
            }
        );
        expect(actual).to.deep.equal({
            duration: 60,
            clientName: "Deleted client " + clientId,
            clientCompany: "Deleted Client",
            makerName: "makerFirst1 makerLast1"
        });
    });

    it('Should successfully grab the sheet details with a deleted maker', async function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true);
        let clientId = 1;
        let makerId = 5;
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: makerId,
                planId: "asdf",
                clientId: clientId,
                timeIn: "2020-01-01 01:00:00",
                timeOut: "2020-01-01 02:00:00",
                task: "some task",
                adminNote: "created normally",
                relationshipId: 4
            }
        );
        expect(actual).to.deep.equal({
            duration: 60,
            clientName: "clientFirst1 clientLast1",
            clientCompany: "clientCompany1",
            makerName: `Deleted maker ${makerId}`
        });
    });

    it('Should fail on validation failure', async function () {
        let emailServiceStub = sinon.stub(emailService, "notifyAdmin").callsFake(function (){});
        sinon.stub(reportingService, "validateMaps").callsFake(function () {
            return new Promise((resolve, reject) => {
                reject();
            })
        });
        let clientId = 1;
        let makerId = 1;
        let actual = await reportingService.getSheetDetails(
            {
                id: 1,
                makerId: makerId,
                planId: "asdf",
                clientId: clientId,
                timeIn: "2020-01-01 01:00:00",
                timeOut: "2020-01-01 02:00:00",
                task: "some task",
                adminNote: "created normally",
                relationshipId: 4
            }
        );
        sinon.assert.calledTwice(emailService.notifyAdmin)
    });
});


describe('Get Report for Relationship Test', function () {

    beforeEach(function () {
        let validateStub = sinon.stub(reportingService, "validateMaps").resolves(true);
        let scopeRelationship = nock(process.env.TWINBEE_URL)
        .post('/api/getRelationshipById', {auth: process.env.TWINBEE_MASTER_AUTH, id: 2})
        .reply(200,
            JSON.stringify({id: 2, clientId: 'b', makerId: 2, occupation: "testOc", hourlyRate: 2})
        );
        let scopeAllSheets = nock(process.env.TWINBEE_URL)
            .post('/api/getAllTimeSheets', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                JSON.stringify([timeSheetRefined1,timeSheetRefined2, timeSheetRefined3, timeSheetRefined4])
            );
        reportingService.clientMap = {
            "1": {
                id: "1",
                first_name: "clientFirst1",
                last_name: "clientLast1",
                company: "clientCompany1"
            },
            "2": {
                id: "2",
                first_name: "clientFirst2",
                last_name: "clientLast2",
            }
        };
        reportingService.makerMap = {
            "1": {
                id: "1",
                firstName: "makerFirst1",
                lastName: "makerLast1"
            },
            "2": {
                id: "2",
                firstName: "makerFirst2",
                lastName: "makerLast2",
            }
        };
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should successfully grab the report with results normally', async function () {
        let actual = await reportingService.getReportForRelationship('2019-01-01 01:00:00', '2019-09-01 01:00:00', 2)
        expect(actual).to.deep.equal({
            sheets:[{id:2, duration: 60, plan:20, clientName: "Deleted client b", company: "Deleted Client", makerName: "makerFirst1 makerLast1", occupation: "testOc"}],
            penniesOwed:2,
            total: 60
        })
    });
});

describe('Reporting Map Setup Test', function () {
    beforeEach(function () {
        let scopeClient = nock(process.env.TWINBEE_URL)
            .post('/api/getAllClients', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                JSON.stringify([
                    {
                        customer: {
                            id: 'AzqgtCRyKk3FHgJN',
                            first_name: 'new',
                            last_name: 'cust',
                            email: 'nope@custom.cust',
                            auto_collection: 'on',
                            net_term_days: 0,
                            allow_direct_debit: false,
                            created_at: 1588880832,
                            taxability: 'taxable',
                            updated_at: 1588880832,
                            pii_cleared: 'active',
                            resource_version: 1588880832994,
                            deleted: false,
                            object: 'customer',
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    },
                    {
                        customer: {
                            id: 'AzqgtCRyKs3FHgJN',
                            first_name: 'new',
                            last_name: 'cust',
                            email: 'nope@custom.cust',
                            auto_collection: 'on',
                            net_term_days: 0,
                            allow_direct_debit: false,
                            created_at: 1588880832,
                            taxability: 'taxable',
                            updated_at: 1588880832,
                            pii_cleared: 'active',
                            resource_version: 1588880832994,
                            deleted: false,
                            object: 'customer',
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    }
                ])
            );
        let scopeMaker = nock(process.env.TWINBEE_URL)
            .post('/api/getAllMakers', {auth: process.env.TWINBEE_MASTER_AUTH})
            .reply(200,
                JSON.stringify([
                    {
                        customer: {
                            id: 'AzqgtCRyKk3FHgJN',
                            first_name: 'new',
                            last_name: 'cust',
                            email: 'nope@custom.cust',
                            auto_collection: 'on',
                            net_term_days: 0,
                            allow_direct_debit: false,
                            created_at: 1588880832,
                            taxability: 'taxable',
                            updated_at: 1588880832,
                            pii_cleared: 'active',
                            resource_version: 1588880832994,
                            deleted: false,
                            object: 'customer',
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    },
                    {
                        customer: {
                            id: 'AzqgtCRyKs3FHgJN',
                            first_name: 'new',
                            last_name: 'cust',
                            email: 'nope@custom.cust',
                            auto_collection: 'on',
                            net_term_days: 0,
                            allow_direct_debit: false,
                            created_at: 1588880832,
                            taxability: 'taxable',
                            updated_at: 1588880832,
                            pii_cleared: 'active',
                            resource_version: 1588880832994,
                            deleted: false,
                            object: 'customer',
                            card_status: 'no_card',
                            promotional_credits: 0,
                            refundable_credits: 0,
                            excess_payments: 0,
                            unbilled_charges: 0,
                            preferred_currency_code: 'USD'
                        }
                    }
                ])
            );
    });

    afterEach(function () {
        sinon.restore();
    });

    it('Should have the right number of clients without nesting them', async function () {
        await reportingService.setup();
        expect(reportingService.clientMap).to.deep.equal({
            'AzqgtCRyKk3FHgJN': {
                id: 'AzqgtCRyKk3FHgJN',
                first_name: 'new',
                last_name: 'cust',
                email: 'nope@custom.cust',
                auto_collection: 'on',
                net_term_days: 0,
                allow_direct_debit: false,
                created_at: 1588880832,
                taxability: 'taxable',
                updated_at: 1588880832,
                pii_cleared: 'active',
                resource_version: 1588880832994,
                deleted: false,
                object: 'customer',
                card_status: 'no_card',
                promotional_credits: 0,
                refundable_credits: 0,
                excess_payments: 0,
                unbilled_charges: 0,
                preferred_currency_code: 'USD'
            },
            'AzqgtCRyKs3FHgJN': {
                id: 'AzqgtCRyKs3FHgJN',
                first_name: 'new',
                last_name: 'cust',
                email: 'nope@custom.cust',
                auto_collection: 'on',
                net_term_days: 0,
                allow_direct_debit: false,
                created_at: 1588880832,
                taxability: 'taxable',
                updated_at: 1588880832,
                pii_cleared: 'active',
                resource_version: 1588880832994,
                deleted: false,
                object: 'customer',
                card_status: 'no_card',
                promotional_credits: 0,
                refundable_credits: 0,
                excess_payments: 0,
                unbilled_charges: 0,
                preferred_currency_code: 'USD'
            }

        });
    });
    it('Should have the right number of makers without nesting them', async function () {
        await reportingService.setup();
        expect(reportingService.clientMap).to.deep.equal({
            'AzqgtCRyKk3FHgJN': {
                id: 'AzqgtCRyKk3FHgJN',
                first_name: 'new',
                last_name: 'cust',
                email: 'nope@custom.cust',
                auto_collection: 'on',
                net_term_days: 0,
                allow_direct_debit: false,
                created_at: 1588880832,
                taxability: 'taxable',
                updated_at: 1588880832,
                pii_cleared: 'active',
                resource_version: 1588880832994,
                deleted: false,
                object: 'customer',
                card_status: 'no_card',
                promotional_credits: 0,
                refundable_credits: 0,
                excess_payments: 0,
                unbilled_charges: 0,
                preferred_currency_code: 'USD'
            },
            'AzqgtCRyKs3FHgJN': {
                id: 'AzqgtCRyKs3FHgJN',
                first_name: 'new',
                last_name: 'cust',
                email: 'nope@custom.cust',
                auto_collection: 'on',
                net_term_days: 0,
                allow_direct_debit: false,
                created_at: 1588880832,
                taxability: 'taxable',
                updated_at: 1588880832,
                pii_cleared: 'active',
                resource_version: 1588880832994,
                deleted: false,
                object: 'customer',
                card_status: 'no_card',
                promotional_credits: 0,
                refundable_credits: 0,
                excess_payments: 0,
                unbilled_charges: 0,
                preferred_currency_code: 'USD'
            }

        });
    });
});