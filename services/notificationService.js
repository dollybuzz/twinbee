const {WebClient} = require('@slack/web-api');
const slackToken = process.env.SLACK_TOKEN;
const web = new WebClient(slackToken);
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});


/**
 * AWS SES send function.  Sends email with current credentials and configurations.
 * Reply-to and from will both be visible as the currently configured email.
 *
 * @param toEmail   - address to send to
 * @param subject   - email subject as it will appear in the recipient's inbox
 * @param content   - email content as it will appear for the recipient (html or plain text)
 */
exports.sendAWS = (toEmail, subject, content) => {
    var params = {
        Destination: { /* required */
            ToAddresses: [
                toEmail
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: content
                },
                Text: {
                    Charset: "UTF-8",
                    Data: content
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        Source: process.env.NOTIFIER_EMAIL, /* required */
        ReplyToAddresses: [
            process.env.NOTIFIER_EMAIL,
            /* more items */
        ],
    };

// Create the promise and SES service object
    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
    sendPromise.then(
        function (data) {
            console.log(data.MessageId);
        }).catch(
        function (err) {
            console.error(err, err.stack);
            exports.notifyAdmin(err);
            exports.notifyAdmin(err.stack);
        });
};


/**
 * Sends an email to the designated email with designated subject
 * and html content
 *
 * @param toEmail   - email to send to
 * @param subject   - subject of email
 * @param content   - content
 */
exports.sendEmail = (toEmail, subject, content) => new Promise((resolve, reject) => {
    if (process.env.TWINBEE_LIVE) {
    console.log(`Sending an email to ${toEmail} with subject ${subject}`);
    exports.sendAWS(toEmail, subject, content);
    } else {
        let message = `An email would have been sent with subject ${subject}, but we aren't on the live site.`;
        console.log(message);
        exports.notifyAdmin(message);
    }
});

/**
 * Sends a welcome email with a link to the live website to the designated
 * email address
 *
 * @param toEmail   - email to send to
 */
exports.sendClientWelcome = toEmail => new Promise((resolve, reject) => {
    if (process.env.TWINBEE_LIVE) {
        let subject = "Welcome to Freedom Makers!";
        let content = `<body style="position: relative;width: 100%;height: 100vh;color: #32444e;background-color: #32444e; overflow: hidden">
<header style="text-align: center;width: inherit;height: auto;background-color: #e8ecef;">

    <div id="landingContainer"
         style="display: grid;width: inherit;grid-template-columns: 1fr 3fr 1fr;vertical-align: center;">
        <div id="intentionallyEmpty"></div>
        <div id="landingLogo" style="width: inherit;padding: 15px;">
            <img src="https://www.freedom-makers-hours.com/img/freedom-makers-logo.png" id="actualImage" alt="Freedom Makers Logo">
        </div>
    </div>
    <div id="pageTitle"
         style="width: inherit;height: auto;font-size: 1.5em;background-color: #32444e;color: white;text-align: center;padding: 6px;">
        <h2 style="color: #dbb459;">Welcome!</h2>
    </div>
</header>
<div id="landingMain" style="background-color: white;width: 100%;height: 30vh;text-align: center;padding-top: 250px; font-size: larger">
    <p>Your account is ready! <br>Sign in at our
        <a href='https://www.freedom-makers-hours.com'>Freedom Makers Client Portal</a> to manage your account. Please navigate to 'Manage Available Hours' and update your payment method to get started!
        </p>
    <br><br>
</div>
<div id="footer" style="width: inherit;height: 100px;position: relative;left: 0;color: white;text-decoration: none;text-align: center;background-color: #32444e;padding-top: 5px;">
    This email was sent to notify you of your account's successful setup. No unsubscribe necessary.
    <div class="copyright">
        <h6>©2020 <img src="https://www.freedom-makers-hours.com/img/TwinBee.png" id="twinbeeLogo" alt="TwinBee Logo" style="display: inline;width: 180px;"></h6>
    </div>
</div>
</body>
`
        console.log(`Sending an email to ${toEmail} with subject ${subject}`);
        exports.sendAWS(toEmail, subject, content);
    } else {
        let message = "A welcome email would have been sent, but we aren't on the live site.";
        console.log(message);
        exports.notifyAdmin(message);
    }
});

/**
 * Sends a welcome email with a link to the live website to the designated
 * email address
 *
 * @param toEmail   - email to send to
 */
exports.sendMakerWelcome = toEmail => new Promise((resolve, reject) => {
    if (process.env.TWINBEE_LIVE) {
    let subject = "Welcome to Freedom Makers!";
    let content = `<body style="position: relative;width: 100%;height: 100vh;color: #32444e;background-color: #32444e; overflow: hidden">
<header style="text-align: center;width: inherit;height: auto;background-color: #e8ecef;">

    <div id="landingContainer"
         style="display: grid;width: inherit;grid-template-columns: 1fr 3fr 1fr;vertical-align: center;">
        <div id="intentionallyEmpty"></div>
        <div id="landingLogo" style="width: inherit;padding: 15px;">
            <img src="https://www.freedom-makers-hours.com/img/freedom-makers-logo.png" id="actualImage" alt="Freedom Makers Logo">
        </div>
    </div>
    <div id="pageTitle"
         style="width: inherit;height: auto;font-size: 1.5em;background-color: #32444e;color: white;text-align: center;padding: 6px;">
        <h2 style="color: #dbb459;">Welcome!</h2>
    </div>
</header>
<div id="landingMain" style="background-color: white;width: 100%;height: 30vh;text-align: center;padding-top: 250px; font-size: larger">
    <p>Your account is ready! <br>Sign in at our
        <a href='https://www.freedom-makers-hours.com'>Freedom Makers Portal</a> to get started!</p>
    <br><br>
</div>
<div id="footer" style="width: inherit;height: 100px;position: relative;left: 0;color: white;text-decoration: none;text-align: center;background-color: #32444e;padding-top: 5px;">
    This email was sent to notify you of your account's successful setup. No unsubscribe necessary.
    <div class="copyright">
        <h6>©2020 <img src="https://www.freedom-makers-hours.com/img/TwinBee.png" id="twinbeeLogo" alt="TwinBee Logo" style="display: inline;width: 180px;"></h6>
    </div>
</div>
</body>
`
    console.log(`Sending an email to ${toEmail} with subject ${subject}`);
    exports.sendAWS(toEmail, subject, content);
    } else {
        let message = "A welcome email would have been sent, but we aren't on the live site.";
        console.log(message);
        exports.notifyAdmin(message);
    }
});

/**
 *
 * @param content
 */
exports.notifyAdmin = content => {
    let tracer = new Error();

    let channel = process.env.NOTIFICATION_CHANNEL;
    console.log(`Notifying admin!`);
    web.chat.postMessage({
        text: content,
        channel: channel,
    }).catch(err => {
        console.log(err + `     Trace: ${JSON.stringify(tracer.stack)}`);
        exports.notifyAdmin(err.toString());
        exports.notifyAdmin(tracer.stack);
    });
};

exports.bugReport = content => {
    let tracer = new Error();

    let channel = process.env.BUG_REPORT_CHANNEL;
    console.log(`Notifying admin!`);
    web.chat.postMessage({
        text: content,
        channel: channel,
    }).catch(err => {
        console.log(err + `     Trace: ${JSON.stringify(tracer.stack)}`);
        exports.notifyAdmin(err.toString());
        exports.notifyAdmin(tracer.stack);
    });
};

exports.notifyFMAdminPaymentSourceAdded = (customerName, paymentType) =>{
    exports.emailFMAdmin("Payment source added!",
        `<body style="position: relative;width: 100%;height: 100vh;color: #32444e;background-color: #32444e; overflow: hidden">
<header style="text-align: center;width: inherit;height: auto;background-color: #e8ecef;">

    <div id="landingContainer"
         style="display: grid;width: inherit;grid-template-columns: 1fr 3fr 1fr;vertical-align: center;">
        <div id="intentionallyEmpty"></div>
        <div id="landingLogo" style="width: inherit;padding: 15px;">
            <img src="https://www.freedom-makers-hours.com/img/freedom-makers-logo.png" id="actualImage" alt="Freedom Makers Logo">
        </div>
    </div>
    <div id="pageTitle"
         style="width: inherit;height: auto;font-size: 1.5em;background-color: #32444e;color: white;text-align: center;padding: 6px;">
        <h2 style="color: #dbb459;">Freedom Makers</h2>
    </div>
</header>
<div id="landingMain" style="background-color: white;width: 100%;height: 25vh;text-align: center;padding-top: 250px; font-size: larger">
                                <h4>${customerName} added a new ${paymentType} for payments!</h4>
<br>

</div>
<div id="footer" style="width: inherit;height: 100px;position: relative;left: 0;color: white;text-decoration: none;text-align: center;background-color: #32444e;padding-top: 5px;">
    This email was sent to notify you of your account's successful setup. No unsubscribe necessary.
    <div class="copyright">
        <h6>©2020 <img src="https://www.freedom-makers-hours.com/img/TwinBee.png" id="twinbeeLogo" alt="TwinBee Logo" style="display: inline;width: 180px;"></h6>
    </div>
</div>
</body>`).catch(e => logCaughtError(e));
}

exports.notifyClientOutOfCredits = email=>{
    exports.sendEmail(
        email, "Freedom Makers - Out of credits!",
        `<body style="position: relative;width: 100%;height: 100vh;color: #32444e;background-color: #32444e; overflow: hidden">
<header style="text-align: center;width: inherit;height: auto;background-color: #e8ecef;">

    <div id="landingContainer"
         style="display: grid;width: inherit;grid-template-columns: 1fr 3fr 1fr;vertical-align: center;">
        <div id="intentionallyEmpty"></div>
        <div id="landingLogo" style="width: inherit;padding: 15px;">
            <img src="https://www.freedom-makers-hours.com/img/freedom-makers-logo.png" id="actualImage" alt="Freedom Makers Logo">
        </div>
    </div>
    <div id="pageTitle"
         style="width: inherit;height: auto;font-size: 1.5em;background-color: #32444e;color: white;text-align: center;padding: 6px;">
        <h2 style="color: #dbb459;">Freedom Makers</h2>
    </div>
</header>
<div id="landingMain" style="background-color: white;width: 100%;height: 25vh;text-align: center;padding-top: 250px; font-size: larger">
                                <h3>You're out of credits!</h3>
                                <h4>Please <a href="https://www.freedom-makers-hours.com">log in</a> to pay any overdue fees and refill your credits as needed!</h4>
<br>

</div>
<div id="footer" style="width: inherit;height: 100px;position: relative;left: 0;color: white;text-decoration: none;text-align: center;background-color: #32444e;padding-top: 5px;">
    This email was sent to notify you of your account's successful setup. No unsubscribe necessary.
    <div class="copyright">
        <h6>©2020 <img src="https://www.freedom-makers-hours.com/img/TwinBee.png" id="twinbeeLogo" alt="TwinBee Logo" style="display: inline;width: 180px;"></h6>
    </div>
</div>
</body>`)
};

exports.notifyClientLowCredits = email=>{
    exports.sendEmail(
        email, "Freedom Makers - Low hours!",
        `<body style="position: relative;width: 100%;height: 100vh;color: #32444e;background-color: #32444e; overflow: hidden">
<header style="text-align: center;width: inherit;height: auto;background-color: #e8ecef;">

    <div id="landingContainer"
         style="display: grid;width: inherit;grid-template-columns: 1fr 3fr 1fr;vertical-align: center;">
        <div id="intentionallyEmpty"></div>
        <div id="landingLogo" style="width: inherit;padding: 15px;">
            <img src="https://www.freedom-makers-hours.com/img/freedom-makers-logo.png" id="actualImage" alt="Freedom Makers Logo">
        </div>
    </div>
    <div id="pageTitle"
         style="width: inherit;height: auto;font-size: 1.5em;background-color: #32444e;color: white;text-align: center;padding: 6px;">
        <h2 style="color: #dbb459;">Freedom Makers</h2>
    </div>
</header>
<div id="landingMain" style="background-color: white;width: 100%;height: 25vh;text-align: center;padding-top: 250px; font-size: larger">
                                <h3>You're low on credits!</h3>
                                <h4>Your available hours have just dropped below your set threshold! <a href="https://www.freedom-makers-hours.com">Log in</a> to purchase more hours.</h4>
                                <br>
                                <h6>Adjust these notifications in your account settings.</h6>                                
<br>

</div>
<div id="footer" style="width: inherit;height: 100px;position: relative;left: 0;color: white;text-decoration: none;text-align: center;background-color: #32444e;padding-top: 5px;">
    This email was sent to notify you of your account's successful setup. No unsubscribe necessary.
    <div class="copyright">
        <h6>©2020 <img src="https://www.freedom-makers-hours.com/img/TwinBee.png" id="twinbeeLogo" alt="TwinBee Logo" style="display: inline;width: 180px;"></h6>
    </div>
</div>
</body>`)
};

exports.emailFMAdminClientUpdate = (planId, numHours, clientName)=>{
    exports.emailFMAdmin("Hours added!",
        `<body style="position: relative;width: 100%;height: 100vh;color: #32444e;background-color: #32444e; overflow: hidden">
<header style="text-align: center;width: inherit;height: auto;background-color: #e8ecef;">

    <div id="landingContainer"
         style="display: grid;width: inherit;grid-template-columns: 1fr 3fr 1fr;vertical-align: center;">
        <div id="intentionallyEmpty"></div>
        <div id="landingLogo" style="width: inherit;padding: 15px;">
            <img src="https://www.freedom-makers-hours.com/img/freedom-makers-logo.png" id="actualImage" alt="Freedom Makers Logo">
        </div>
    </div>
    <div id="pageTitle"
         style="width: inherit;height: auto;font-size: 1.5em;background-color: #32444e;color: white;text-align: center;padding: 6px;">
        <h2 style="color: #dbb459;">Hours added!</h2>
    </div>
</header>
<div id="landingMain" style="background-color: white;width: 100%;height: 25vh;text-align: center;padding-top: 250px; font-size: larger">
                                <h4>${clientName} has manually added ${numHours} hour(s) for time bucket ${planId}</h4>
<br>

</div>
<div id="footer" style="width: inherit;height: 100px;position: relative;left: 0;color: white;text-decoration: none;text-align: center;background-color: #32444e;padding-top: 5px;">
    This email was sent to notify you of your account's successful setup. No unsubscribe necessary.
    <div class="copyright">
        <h6>©2020 <img src="https://www.freedom-makers-hours.com/img/TwinBee.png" id="twinbeeLogo" alt="TwinBee Logo" style="display: inline;width: 180px;"></h6>
    </div>
</div>
</body>`);
};

exports.emailFMAdminClientChange = (clientId)=>{
    exports.emailFMAdmin("Client Contact Change!",
        `<body style="position: relative;width: 100%;height: 100vh;color: #32444e;background-color: #32444e; overflow: hidden">
<header style="text-align: center;width: inherit;height: auto;background-color: #e8ecef;">

    <div id="landingContainer"
         style="display: grid;width: inherit;grid-template-columns: 1fr 3fr 1fr;vertical-align: center;">
        <div id="intentionallyEmpty"></div>
        <div id="landingLogo" style="width: inherit;padding: 15px;">
            <img src="https://www.freedom-makers-hours.com/img/freedom-makers-logo.png" id="actualImage" alt="Freedom Makers Logo">
        </div>
    </div>
    <div id="pageTitle"
         style="width: inherit;height: auto;font-size: 1.5em;background-color: #32444e;color: white;text-align: center;padding: 6px;">
        <h2 style="color: #dbb459;">Hours added!</h2>
    </div>
</header>
<div id="landingMain" style="background-color: white;width: 100%;height: 25vh;text-align: center;padding-top: 250px; font-size: larger">
                                <h4>Contact info for client with ID: ${clientId} has been changed!  </h4>
                                <h4>Please <a href="https://www.freedom-makers-hours.com">Log in</a> and verify the correctness of the data.</h4>
<br>

</div>
<div id="footer" style="width: inherit;height: 100px;position: relative;left: 0;color: white;text-decoration: none;text-align: center;background-color: #32444e;padding-top: 5px;">
    This email was sent to notify you of your account's successful setup. No unsubscribe necessary.
    <div class="copyright">
        <h6>©2020 <img src="https://www.freedom-makers-hours.com/img/TwinBee.png" id="twinbeeLogo" alt="TwinBee Logo" style="display: inline;width: 180px;"></h6>
    </div>
</div>
</body>`);
};

/**
 * Sends an email to the Freedom Makers admins
 * @param subject - email subject
 * @param content - email content
 * @returns {Promise<>}
 */
exports.emailFMAdmin = (subject, content) => {
    if (process.env.TWINBEE_LIVE) {
        console.log(`Emailing Freedom Makers!`);
        exports.sendAWS(process.env.FREEDOM_MAKERS_ADMIN_EMAIL, subject, content);
    } else {
        let message = "An email would have been sent to FM admins, but we aren't on the live site.";
        console.log(message);
        exports.notifyAdmin(message);
    }
};