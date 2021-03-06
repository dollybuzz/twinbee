const chargebeeService = require('../services/chargebeeService.js');
const {validateParams} = require("../util.js");
const {logCaughtError} = require('../util.js');
const getEmailFromToken = require("../util.js").dereferenceToken;


module.exports = {


    /**
     * ENDPOINT: /api/updateMySubscription
     * Updates a subscription with new values. Note that
     * the pricePerHour will override defaults. This can be used
     * to create "custom" subscriptions. Use caution when doing so.
     * The revised subscription is returned. Looks for values in the body as follows:
     * {
     *     "subscriptionId": id of subscription to be modified,
     *     "planQuantity": new number of hours to use,
     *     "auth": client's authentication token
     * }
     *
     * @returns subscription{}
     */
    updateMySubscription: async function (req, res) {
        console.log("Attempting to update subscription from  REST by client request: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["subscriptionId", "auth"],
                "positiveDecimalAllowed": ["planQuantity"]
            },req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let subscriptionOwner = await chargebeeService.getCustomerOfSubscription(req.body.subscriptionId).catch(err => logCaughtError(err));
            let clientEmail = await getEmailFromToken(req.body.auth).catch(err => logCaughtError(err));
            let client = await chargebeeService.getCustomerByEmail(clientEmail).catch(err => logCaughtError(err));
            console.log(client.id);
            console.log(subscriptionOwner.id);
            if (client.id === subscriptionOwner.id) {
                res.send(await chargebeeService.updateSubscriptionForCustomer(req.body.subscriptionId,
                    req.body.planQuantity).catch(err => logCaughtError(err)));
            } else
                res.send(false);
        }
    },
    
    
    /**
     * ENDPOINT: /api/getAllPlans
     * Retrieves all plans from the {TEST} environment as chargebee entries.
     * Note that in order to access meaningful data, an intermediate object is
     * accessed.  E.g, to access "pricing_model", given that "returnedValue" is the
     * result of this function, use:
     *  returnedValue[0].plan.pricing_model
     *  returns data as follows:
     *  [
     *      {
     *          "plan":{}
     *      },
     *      {
     *          "plan":{}
     *      }
     *  ]
     *
     *  Looks for data in the body in the form:
     *  {
     *     "auth": authentication credentials; either master or token
     *  }
     * @returns [{entry:plan{}},...]
     */
    getAllPlans: async function (req, res) {
        console.log("Attempting to get all plans from REST: ");
        console.log(req.body);
        let plans = await chargebeeService.getAllPlans().catch(err => logCaughtError(err));
        res.send(plans);
    },

    /**
     * ENDPOINT: /api/createPlan
     * Creates a new plan in the {TEST} environment. looks for values in the body as follows:
     * {
     *     "planId": name of plan,
     *     "invoiceName": name as it should appear on an invoice,
     *     "pricePerHour": integer price per hour in cents,
     *     "planDescription": general description of plan,
     *     "auth": authentication credentials; either master or token
     * }
     */
    createPlan: async function (req, res) {
        console.log("Attempting to create a plan from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["invoiceName", "planDescription"],
                "noSpaces": ["planId"],
                "decimalAllowed": ["pricePerHour"]
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await chargebeeService.createPlan(req.body.planId, req.body.invoiceName,
                req.body.pricePerHour, req.body.planDescription).catch(err => logCaughtError(err)));
        }
    },

    /**
     * /api/retrievePlan
     * Retrieves a chargebee plan object by chargebee plan id. Looks for values
     * in the body as follows:
     * {
     *     "planId": chargebee plan id,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns plan{}
     */
    retrievePlan: async function (req, res) {
        console.log("Attempting to retrieve a plan from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["planId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let planActual = await chargebeeService.retrievePlan(req.body.planId)
                .catch(err => logCaughtError(err));
            res.send({plan: planActual});
        }
    },

    /**
     * ENDPOINT: /api/updatePlan
     * Updates a plan with new values. Note that the plan id is
     * NOT updated on changing the plan's name. Looks for values in the body as follows;
     * {
     *      "planId": existing chargebee plan id,
     *      "planInvoiceName": new desired name as it should appear on an invoice,
     *      "planPrice": overridden plan price in cents as integer,
     *     "auth": authentication credentials; either master or token
     *
     * }
     */
    updatePlan: async function (req, res) {
        console.log("Attempting to update a plan from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["planInvoiceName"],
                "positiveIntegerOnly": ["planPrice"],
                "noSpaces": ["planId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            chargebeeService.updatePlan(req.body.planId, req.body.planId,
                req.body.planInvoiceName, req.body.planPrice);
            res.send({status: "update request processed"});
        }
    },

    /**
     * ENDPOINT: /api/deletePlan
     * Deletes a plan by chargebee plan id. Looks for values in the body as follows:
     * {
     *     "planId": chargebee plan id,
     *     "auth": authentication credentials; either master or token
     * }
     */
    deletePlan: async function (req, res) {
        console.log("Attempting to delete a plan from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["planId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            chargebeeService.deletePlan(req.body.planId);
            res.send({status: "delete request processed"});
        }
    },


    /**
     * ENDPOINT: /api/getAllSubscriptions
     * Retrieves all subscriptions.
     * Returns values as follows:
     * [
     *      {
     *          "customer": {
     *              ...
     *          },
     *          "subscription": {
     *              ...
     *          },
     *          "card": {
     *              ...
     *          }
     *      },...
     * ]
     * Looks for data in the body as follows
     * {
     *     "auth": authentication credentials; either master or token
     * }
     * @returns [{"customer":{},"subscription":{},"card":{}},...]
     */
    getAllSubscriptions: async function (req, res) {
        console.log("Attempting to get all subscriptions from REST: ");
        console.log(req.body);
        let subscriptions = await chargebeeService.getAllSubscriptions()
            .catch(err => logCaughtError(err));
        res.send(subscriptions);
    },


    /**
     * /api/createSubscription
     * Creates a new subscription for an existing customer.
     * Note that auto_collection is ALWAYS on. Looks for values in the body as follows:
     * {
     *     "planId": id of the plan to subscribe to,
     *     "customerId": id of the subscribing customer,
     *     "planQuantity": initial number of hours to subscribe to,
     *     "startDate": date to start subscription,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns subscription{}
     */
    createSubscription: async function (req, res) {
        console.log("Attempting to create a subscription from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["planId", "customerId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let sub = await chargebeeService.createSubscription(req.body.planId, req.body.customerId,
                req.body.planQuantity, req.body.startDate)
                .catch(err => logCaughtError(err));
            res.send(sub);
        }
    },

    /**
     * /api/retrieveBucketRate
     * Retrieves the hourly rate of a plan for the associated client bucket. If a
     * customer has a customized rate due to a discounted or penaltied subscription,
     * that rate is used. Otherwise, the plan's default rate is used.
     * Looks for data in the body as follows:
     * {
     *     "auth": authentication credentials; either master or token,
     *     "clientId": id of desired client to check
     *     "planId": planId name / bucket name (bucket name and planId should always be identical),
     * }
     *
     * @returns subscription{}
     */
    retrieveBucketRate: async function (req, res) {
        console.log("Attempting to retrieve bucket rate from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": ["clientId"],
                "positiveIntegerOnly": [],
                "noSpaces": ["planId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let price = await chargebeeService.getPlanPriceForCustomer(req.body.clientId, req.body.planId)
                .catch(err => logCaughtError(err));
            res.send({price: price});
        }
    },


    /**
     * /api/retrieveSubscription
     * Retrieves a subscription object by chargebee subscription id. Looks for values in the body
     * as follows:
     * {
     *     "subscriptionId": id of desired subscription,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns subscription{}
     */
    retrieveSubscription: async function (req, res) {
        console.log("Attempting to retrieve one subscription from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["subscriptionId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let subscription = await chargebeeService.retrieveSubscription(req.body.subscriptionId)
                .catch(err => logCaughtError(err));
            res.send(subscription);
        }
    },


    /**
     * /api/retrieveSubscriptionChanges
     * Retrieves a subscription object by chargebee subscription id. Looks for values in the body
     * as follows:
     * {
     *     "subscriptionId": id of desired subscription,
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns subscription{}
     */
    retrieveSubscriptionChanges: async function (req, res) {
        console.log("Attempting to retrieve one subscription's scheduled changes from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["subscriptionId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let subscription = await chargebeeService.retrieveSubscriptionWithChanges(req.body.subscriptionId)
                .catch(err => logCaughtError(err));

            //Note: Chargebee's "plan_amount" appears to not actually be the new plan amount
            subscription.twinbee_calculated_price = subscription.plan_quantity * subscription.plan_unit_price;
            res.send(subscription);
        }
    },

    /**
     * /api/undoSubscriptionChanges
     * Cancels any pending subscription changes for the given subscription.
     * Looks for values in the body as follows:
     * {
     *     "subscriptionId: id of desired subscription,
     *     "auth": auth credentials, master or token
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    undoSubscriptionChanges: async function (req, res) {
        console.log(`Attempting to revert scheduled changes for a subscription...`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["subscriptionId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let subscription = await chargebeeService.cancelScheduledChanges(req.body.subscriptionId)
                .catch(err => logCaughtError(err));
            res.send(subscription);
        }
    },

    /**
     * /api/updateSubscription
     * Updates a subscription with new values. Note that
     * the pricePerHour will override defaults. This can be used
     * to create "custom" subscriptions. Use caution when doing so.
     * The revised subscription is returned. Looks for values in the body as follows:
     * {
     *     "subscriptionId": id of subscription to be modified,
     *     "planId": new plan to use for subscription,
     *     "planQuantity": new number of hours to use,
     *     "pricePerHour": overridden price per hour for subscription
     *     "auth": authentication credentials; either master or token
     * }
     *
     * @returns subscription{}
     */
    updateSubscription: async function (req, res) {
        console.log("Attempting to update subscription from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": ["planQuantity"],
                "noSpaces": ["subscriptionId", "planId"],
                "positiveDecimalAllowed": ["pricePerHour"],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let subscription = await chargebeeService.updateSubscription(req.body.subscriptionId, req.body.planId,
                req.body.planQuantity, req.body.pricePerHour)
                .catch(err => logCaughtError(err));
            res.send(subscription);
        }
    },

    /**
     * /api/cancelSubscription
     * cancels a subscription by chargebee subscription id. Looks for values in the
     * body as follows:
     * {
     *     "subscriptionId": subscription to be cancelled,
     *     "auth": authentication credentials; either master or token
     * }
     */
    cancelSubscription: async function (req, res) {
        console.log("Attempting to cancel subscription from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["subscriptionId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            chargebeeService.cancelSubscription(req.body.subscriptionId);
            res.send({status: `subscription cancellation request sent for subscription: ${req.body.subscriptionId}`});
        }
    },

    /**
     * /api/creditNow
     *
     * Charges a customer's default payment (or creates an invoice if not available)
     * for the given number of hours for the specified plan. Looks for data in the
     * body in the form:
     * {
     *     "planId": Chargebee plan id for the plan to be "refilled",
     *     "numHours": Number of hours to add to the clients associated bucket,
     *     "customerId": id of the customer to be updated,
     *     "auth": auth token
     * }
     *
     * @param req
     * @param res
     */
    chargeCustomerNow: async function (req, res) {
        console.log("Attempting to charge customer from REST: ");
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["customerId", "planId"],
                "positiveDecimalAllowed": ["numHours"],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            chargebeeService.chargeCustomerNow(req.body.planId, req.body.numHours, req.body.customerId).catch(err => logCaughtError(err));
            res.send({});
        }
    },

    /**
     * ENDPOINT: /api/getSubscriptionsByClient
     *
     * Retrieves all subscriptions for a given client. Looks for data in the body
     * in the form:
     * {
     *     "id": Client's chargebee id,
     *     "auth": valid auth token
     * }
     * Returns data in the form
     * [
     *      {
     *          subscription: {...},
     *          customer:{...}
     *      },
     *      {
     *          subscription: {...},
     *          customer:{...}
     *      },...
     * ]
     *
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getSubscriptionsByClient: async function (req, res) {
        console.log(`Attempting to get subscriptions for client ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["id"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await chargebeeService.getSubscriptionsByClient(req.body.id).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/pauseSubscription
     *
     * Pauses a currently active subscription at the end of the billing period. Looks
     * for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of subscription to be paused
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    pauseSubscription: async function (req, res) {
        console.log(`Attempting to pause subscription ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["id"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await chargebeeService.pauseSubscription(req.body.id).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/resumePausedSubscription
     *
     * Immediately resumes a currently paused subscription. Looks
     * for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of subscription to be resumed
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    resumePausedSubscription: async function (req, res) {
        console.log(`Attempting to resume subscription ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["id"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await chargebeeService.resumePausedSubscription(req.body.id).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/undoPause
     *
     * Immediately reverts a scheduled pause on a subscription. Looks
     * for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "id": id of subscription to be resumed
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    undoPause: async function (req, res) {
        console.log(`Attempting to reverse pause for subscription ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["id"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await chargebeeService.undoPause(req.body.id).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/pauseMySubscription
     *
     * Pauses a currently active subscription at the end of the billing period. Looks
     * for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "token": requester's token,
     *     "subscriptionId": id of subscription to pause
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    pauseMySubscription: async function (req, res) {
        console.log(`Attempting to pause subscription ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["token", "subscriptionId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await getEmailFromToken(req.body.token);
            console.log(email)
            let client = await chargebeeService.getCustomerByEmail(email);
            console.log(client);
            res.send(await chargebeeService.pauseMySubscription(req.body.subscriptionId, client.id).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/resumeMyPausedSubscription
     *
     * Immediately resumes a currently paused subscription. Looks
     * for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "token": requester's token,
     *     "subscriptionId": id of subscription to pause
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    resumeMyPausedSubscription: async function (req, res) {
        console.log(`Attempting to resume subscription ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["token", "subscriptionId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await getEmailFromToken(req.body.token);
            let client = await chargebeeService.getCustomerByEmail(email);
            res.send(await chargebeeService.resumeMyPausedSubscription(req.body.subscriptionId, client.id).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/undoMyPause
     *
     * Immediately reverts a scheduled pause on a subscription. Looks
     * for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "token": requester's token,
     *     "subscriptionId": id of subscription to pause
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    undoMyPause: async function (req, res) {
        console.log(`Attempting to reverse pause for subscription ${req.body.id} from REST`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["token", "subscriptionId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            let email = await getEmailFromToken(req.body.token);
            let client = await chargebeeService.getCustomerByEmail(email);
            res.send(await chargebeeService.undoMyPause(req.body.subscriptionId, client.id).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/doesCustomerHaveInvoices
     *
     * Determines whether a customer has outstanding invoices. Looks
     * for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "clientId": chargebee customerId
     * }
     * returns a result in the form:
     * { invoicesPresent: true or false }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    doesCustomerHaveInvoices: async function (req, res) {
        console.log(`Attempting to retrieve all invoices for customer ${req.body.clientId}`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["clientId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await chargebeeService.doesCustomerHaveInvoices(req.body.clientId).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/getInvoicesForCustomer
     *
     * Retrieves a list of outstanding invoices for a customer. Looks
     * for data in the body in the form:
     * {
     *     "auth": valid auth token,
     *     "clientId": chargebee customerId
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getInvoicesForCustomer: async function (req, res) {
        console.log(`Attempting to retrieve all invoices for customer ${req.body.clientId}`);
        console.log(req.body);

        let validationResult = await validateParams(
            {
                "present": [],
                "positiveIntegerOnly": [],
                "noSpaces": ["clientId"],
                "positiveDecimalAllowed": [],
                "decimalAllowed": []
            }, req.body);
        if (!validationResult.isValid) {
            res.status(400).send({error: "Bad Request", code: 400, details: validationResult.message});
            logCaughtError({error: "Bad Request", code: 400, details: validationResult.message});
        } else {
            res.send(await chargebeeService.getInvoicesForCustomer(req.body.clientId).catch(err => logCaughtError(err)));
        }
    },

    /**
     * ENDPOINT: /api/getAllTransactions
     *
     * Retrieves all transactions. Looks for data in the body in
     * the form:
     * {
     *     "auth" : valid auth token
     * }
     * @param req
     * @param res
     * @returns {Promise<void>}
     */
    getAllTransactions: async function (req, res) {
        console.log(`Attempting to retrieve all transactions from REST`);
        console.log(req.body);
        res.send(await chargebeeService.getAllTransactions().catch(err => logCaughtError(err)));
    }
};