module.exports = function(request, response) {
    /**
     * Integration of SQLITE3 dependencies
     */
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');

    /**
     * File containing the configurations necessary for the correct functioning of the system
     */
    const config = require('../config');

    /**
     * Twilio identification and declaration
     */
    const client = require('twilio')(config.accountSid, config.authToken);

    /**
     * Retrieving the posted variables used to order the call
     */
    var to = request.body.to || null;
    var user = request.body.user || null;
    var service = request.body.service || null;
    var name = request.body.name || null;
    var callSid = null;

    /**
     * If one of the variables is missing, transmit the error and prevent the operation of the system
     */
    if (to == null || user == null || service == null) {
        return response.status(200).json({
            error: 'Please post all the informations needed.'
        });
    }

    /**
     * If we cannot find the location of the service file, then it means that the service is not supported and we return an error
     */
    if (config[service + 'filepath'] == undefined) {
        return response.status(200).json({
            error: "The service wasn't recognised."
        });
    }

    if (!!!user) {
        return response.status(200).json({
            error: "Bad user name."
        });
    }

    if (!!!service) {
        return response.status(200).json({
            error: "Bad service name."
        });
    }

    /**
     * If the phone number is correct, then we start the call
     */
    if (!to.match(/^\d{8,14}$/g)) {
        return response.status(200).json({
            error: 'Bad phone number.'
        });
    }

    /**
     * Twilio API for making the call
     */
    client.calls.create({
        method: 'POST',
        statusCallbackEvent: ['initiated', 'answered', 'completed'],
        statusCallback: config.serverurl + '/status/' + config.apipassword,
        url: config.serverurl + '/voice/' + config.apipassword,
        to: to,
        from: config.callerid
    }).then((call) => {
        callSid = call.sid;

        /**
         * Addition to the DB Sqlite3 of the call launched
         */
        db.get('SELECT callSid FROM calls WHERE callSid = ?', [callSid], (err, row) => {
            if (err) {
                return console.log(err.message);
            }

            /**
             * If the call has not already been recorded, (check at callSid level => unique call identifier), then record it
             */
            if (row == undefined) {
                db.run(`INSERT INTO calls(callSid, user, service, itsto, name, push) VALUES(?, ?, ?, ?, ?)`, [callSid, user, service, to, name, push], function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            } else {
                db.run(`UPDATE calls SET user = ?, service = ?, itsto = ?, name = ?  WHERE callSid = ?`, [user, service, to, callSid, name], function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            }
        });

        response.status(200).json({
            callSid
        });
    }).catch(error => {
        return response.status(200).json({
            error: 'There was a problem with your call, check if your account is upgraded. ' + error
        });
    });

};
