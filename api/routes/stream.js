module.exports = function(req, res) {
    /**
     * File containing the configurations necessary for the correct functioning of the system
     */
    const config = require('.././config');

    /**
     * Integration of FS dependencies to modify files
     */
    const fs = require('fs');

    /**
     * Creation of a variable storing the name of the service to fetch in the config file
     */
    const service = req.params.service + 'filepath';

    /**
     * If there is a service in the config file, then continue
     */
    if (!!config[service] && config[service] != undefined) {
        /**
         * Retrieving the audio file storage path
         */
        const filePath = config[service];

        /**
         * Calculating the audio file size
         */
        var stat = fs.statSync(filePath);
        var total = stat.size;

        /**
         * Modification of the header so that the file can be used by Twilio
         */
        res.writeHead(200, {
            'Content-Length': total,
            'Content-Type': 'audio/mpeg'
        });
        fs.createReadStream(filePath).pipe(res);
    } else {
        return res.status(200).json({
            error: 'Bad service.'
        });
    }
};