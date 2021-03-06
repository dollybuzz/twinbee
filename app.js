/*
Application Authors: Dalia Faria, Greg Brown
 */

//direct dependencies
const express = require("express");
const bodyParser = require('body-parser');
const sslRedirect = require('heroku-ssl-redirect');
var chargebee = require("chargebee");
chargebee.configure({site : process.env.CHARGEBEE_SITE,
    api_key : process.env.CHARGEBEE_API_KEY});

//routing and rest controllers
const landingPageController = require('./controllers/landingPageController.js');
const clientRestController = require('./controllers/clientRestController.js');
const makerRestController = require('./controllers/makerRestController.js');
const timeSheetRestController = require('./controllers/timeSheetRestController.js');
const relationshipRestController = require('./controllers/relationshipRestController.js');
const chargebeeRestController = require('./controllers/chargebeeRestController.js');
const timeReportingRestController = require('./controllers/timeReportingRestController.js');
const authController = require('./controllers/authController.js');
const notificationRestController = require('./controllers/notificationRestController.js');
const authRestController = require('./controllers/authRestController.js');
const service = require("./services/chargebeeService");

//Express configurations
const app = express();
app.set('view engine', 'ejs');
app.set('port',  process.env.PORT || "8080");
app.set('ip',  process.env.IP || "0.0.0.0");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(sslRedirect());

//page routes
app.get("/googlee47aeec58d0a4570.html", (req, res) => {res.render("googlee47aeec58d0a4570");});
app.get("/", landingPageController.renderLanding);
app.get("/home", landingPageController.renderLanding);
app.get("/landing", landingPageController.renderLanding);
app.get("/login", authController.loginNavigation);

//api routes
app.post("/api/getAllClients",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getAllClients);
app.post("/api/getAllMakers",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.getAllMakers);
app.post("/api/getClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getClientById);
app.post("/api/createClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.createClient);
app.post("/api/deleteClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.deleteClient);
app.post("/api/updateClientContact",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.updateClientContact);
app.post("/api/updateMyContact",
    authController.authorizeClient,
    clientRestController.updateMyContact);
app.post("/api/updateClientMetadata",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.updateClientMetadata);
app.post("/api/updateClientTimeBucket",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.updateClientTimeBucket);
app.post("/api/updateClientBucketThreshold",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.updateClientBucketThreshold);
app.post("/api/getMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.getMakerById);
app.post("/api/createMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.createMaker);
app.post("/api/updateMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.updateMaker);
app.post("/api/deleteMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.deleteMaker);
app.post("/api/getTimeSheetsByClientId",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getTimeSheetsByClientId);
app.post("/api/getTimeSheetsByMakerId",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getTimeSheetsByMakerId);
app.post("/api/getAllTimeSheets",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getAllTimeSheets);
app.post("/api/updateTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.updateTimeSheetsById);
app.post("/api/clearTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.clearTimeSheet);
app.post("/api/createTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.createTimeSheet);
app.post("/api/getOnlineMakers",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.getOnlineMakers);
app.post("/api/getAllPlans",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.getAllPlans);
app.post("/api/createPlan",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.createPlan);
app.post("/api/updatePlan",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.updatePlan);
app.post("/api/getSubscriptionsByClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.getSubscriptionsByClient);
app.post("/api/retrieveSubscriptionChanges",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.retrieveSubscriptionChanges);
app.post("/api/undoSubscriptionChanges",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.undoSubscriptionChanges);
app.post("/api/deletePlan",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.deletePlan);
app.post("/api/retrievePlan",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.retrievePlan);
app.post("/api/getAllSubscriptions",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.getAllSubscriptions);
app.post("/api/createSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.createSubscription);
app.post("/api/updateSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.updateSubscription);
app.post("/api/cancelSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.cancelSubscription);
app.post("/api/retrieveSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.retrieveSubscription);
app.post("/api/clockIn",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.clockIn);
app.post("/api/clockOut",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.clockOut);
app.post("/api/creditNow",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.chargeCustomerNow);
app.post("/api/getMakersForClient",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getMakersForClient);
app.post("/api/getUpdatePaymentURL",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getUpdatePaymentPage);
app.post("/api/getTimeSheet",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.getTimeSheet);
app.post("/api/getClientByToken",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getClientByToken);
app.post("/api/getClientsForMaker",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    makerRestController.getClientsForMaker);
app.post("/api/getMakerIdByToken",
    authController.authorizeMaker,
    authController.authorizeMaster,
    makerRestController.getMakerIdByToken);
app.post("/api/getAllTimeBuckets",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getAllTimeBuckets);
app.post("/api/getTimeBucketsByClientId",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getTimeBucketsByClientId);
app.post("/api/getAllRelationships",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.getAllRelationships);
app.post("/api/createRelationship",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.createRelationship);
app.post("/api/getRelationshipsByMakerId",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipsByMakerId);
app.post("/api/getRelationshipsByClientId",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipsByClientId);
app.post("/api/getRelationshipById",
    authController.authorizeAdmin,
    authController.authorizeMaker,
    authController.authorizeMaster,
    relationshipRestController.getRelationshipById);
app.post("/api/deleteRelationship",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.deleteRelationship);
app.post("/api/updateRelationship",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    relationshipRestController.updateRelationship);
app.post("/api/deleteBucket",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.deleteClientTimeBucket);
app.post("/api/getClientPayInvoicesPage",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getClientPayInvoicesPage);
app.post("/api/tokenToEmail",
    authController.tokenToEmail);
app.post("/api/getClientName",
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.getClientName);
app.post("/api/clientWebHookHit",
    clientRestController.webHookHit);
app.post("/api/tokenToEmail",
    authController.authorizeMaster,
    authController.tokenToEmail);
app.post("/api/getTimeBucket",
    authController.authorizeClient,
    authController.authorizeMaker,
    authController.authorizeAdmin,
    authController.authorizeMaster,
    clientRestController.getTimeBucket);

app.post("/api/getMyTimeSheetsMaker",
    authController.authorizeMaker,
    makerRestController.getMyTimeSheets);
app.post("/api/getMyCurrentTimeSheet",
    authController.authorizeMaker,
    makerRestController.getMyCurrentTimeSheet);
app.post("/api/getMakerCurrentTimeSheet",
    authController.authorizeMaker,
    authController.authorizeMaster,
    timeSheetRestController.getOnlineSheet);
app.post("/api/getMyRelationshipBucket",
    authController.authorizeMaker,
    makerRestController.getMyRelationshipBucket);
app.post("/api/getMyRelationship",
    authController.authorizeMaker,
    makerRestController.getMyRelationship);
app.post("/api/getAllMyRelationshipsMaker",
    authController.authorizeMaker,
    makerRestController.getAllMyRelationships);
app.post("/api/getMyClients",
    authController.authorizeMaker,
    makerRestController.getMyClients);

app.post("/api/getAllMyRelationshipsClient",
    authController.authorizeClient,
    clientRestController.getAllMyRelationships);
app.post("/api/getMyTimeSheetsClient",
    authController.authorizeClient,
    clientRestController.getMyTimeSheets);
app.post("/api/getMySubscriptions",
    authController.authorizeClient,
    clientRestController.getMySubscriptions);
app.post("/api/getMySubscriptionChanges",
    authController.authorizeClient,
    clientRestController.getMySubscriptionChanges);
app.post("/api/undoMySubscriptionChanges",
    authController.authorizeClient,
    clientRestController.undoMySubscriptionChanges);
app.post("/api/retrieveMySubscription",
    authController.authorizeClient,
    clientRestController.retrieveMySubscription);
app.post("/api/getMyPayInvoicesPage",
    authController.authorizeClient,
    clientRestController.getMyPayInvoicesPage);
app.post("/api/chargeMeNow",
    authController.authorizeClient,
    clientRestController.chargeMeNow);
app.post("/api/getMyUpdatePaymentPage",
    authController.authorizeClient,
    clientRestController.getMyUpdatePaymentPage);
app.post("/api/getMyTimeBucket",
    authController.authorizeClient,
    clientRestController.getMyTimeBucket);
app.post("/api/updateMySubscription",
    authController.authorizeClient,
    chargebeeRestController.updateMySubscription);
app.post("/api/updateMyBucketThreshold",
    authController.authorizeClient,
    clientRestController.updateMyBucketThreshold);
app.post("/api/getMyMakers",
    authController.authorizeClient,
    clientRestController.getMyMakers);
app.post("/api/getAllMyTimeBuckets",
    authController.authorizeClient,
    clientRestController.getAllMyTimeBuckets);

app.post("/api/getTimeForMakerClientPair",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeReportingRestController.getTimeForMakerClientPair);
app.post("/api/getAllTransactions",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.getAllTransactions);
app.post("/api/getInvoicesForCustomer",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.getInvoicesForCustomer);
app.post("/api/doesCustomerHaveInvoices",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.doesCustomerHaveInvoices);
app.post("/api/doIHaveInvoices",
    authController.authorizeClient,
    authController.authorizeMaster,
    clientRestController.doIHaveInvoices);
app.post("/api/technicalHelp",
    authController.authorizeAdmin,
    authController.authorizeClient,
    authController.authorizeMaker,
    authController.authorizeMaster,
    notificationRestController.restBugReport);
app.post("/api/notifyAdmin",
    authController.authorizeMaster,
    notificationRestController.notifyAdmin);
app.post("/api/getMakerTimeReport",
    authController.authorizeMaker,
    authController.authorizeMaster,
    timeReportingRestController.getMakerTimeReport);
app.post("/api/getTimeRollup",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeReportingRestController.getTimeRollup);
app.post("/api/onTheGo",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    timeSheetRestController.onTheGo);
app.post("/api/makerOnTheGo",
    authController.authorizeMaker,
    authController.authorizeMaster,
    timeSheetRestController.makerOnTheGo);
app.post("/api/retrieveBucketRate",
    authController.authorizeClient,
    chargebeeRestController.retrieveBucketRate);
app.post("/api/dereferenceToken",
    authController.authorizeMaster,
    authRestController.getEmailFromToken);
app.post("/api/welcomeClient",
    authController.authorizeMaster,
    notificationRestController.sendClientWelcome);
app.post("/api/welcomeMaker",
    authController.authorizeMaster,
    notificationRestController.sendMakerWelcome);
app.post("/api/notifyAdminClientUpdate",
    authController.authorizeMaster,
    notificationRestController.notifyAdminClientUpdate);
app.post("/api/notifyClientOutOfCredits",
    authController.authorizeMaster,
    notificationRestController.notifyClientOutOfCredits);
app.post("/api/notifyClientLowCredits",
    authController.authorizeMaster,
    notificationRestController.notifyClientLowCredits);
app.post("/api/notifyFMAdminPaymentSourceAdded",
    authController.authorizeMaster,
    notificationRestController.notifyFMAdminPaymentSourceAdded);
app.post("/api/pauseSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.pauseSubscription);
app.post("/api/resumePausedSubscription",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.resumePausedSubscription);
app.post("/api/undoPause",
    authController.authorizeAdmin,
    authController.authorizeMaster,
    chargebeeRestController.undoPause);
app.post("/api/pauseMySubscription",
    authController.authorizeClient,
    chargebeeRestController.pauseMySubscription);
app.post("/api/resumeMyPausedSubscription",
    authController.authorizeClient,
    chargebeeRestController.resumeMyPausedSubscription);
app.post("/api/undoMyPause",
    authController.authorizeClient,
    chargebeeRestController.undoMyPause);

app.get("/api/getEnvironment",
    (req, res)=>{res.send(process.env.TWINBEE_ENVIRONMENT_FLAG === 'test')});

(async function() {
})();

app.listen(app.get('port'), app.get('ip'),()=>{console.log(`Express Server is Running at ${app.get('ip')} on port ${app.get('port')}`);});
