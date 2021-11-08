module.exports = function(request, response) {
    /**
     * Integration of SQLITE3 dependencies
     */
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./db/data.db');

    var callSid = request.body.callSid;

    /**
     * GET command to the DB to retrieve information on a call made,
     * use of the callSid.
     */
    db.get('SELECT callSid FROM calls WHERE callSid = ?', [callSid], (err, row) => {
        if (err) {
            return console.log(err.message);
        }

        if (row == undefined) {
            /**
             * If the call is not found in db, error return
             */
            response.status(200).json({
                error: 'Invalid callSid.'
            });
        } else {
            /**
             * Otherwise take the information in DB and return them
             */
            db.get('SELECT * FROM calls WHERE callSid  = ?', [callSid], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }

                /**
                 * Return information in JSON format for convenience
                 */
                response.status(200).json({
                    itsto: row.itsto,
                    itsfrom: row.itsfrom,
                    callSid: row.callSid,
                    digits: row.digits,
                    status: row.status,
                    date: row.date,
                    user: row.user,
                    service: row.service,
                    push: row.push
                });
            });
        }
    });
};