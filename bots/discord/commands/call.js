module.exports = function(m) {
    /**
     * Instantiating function dependencies
     */
    const axios = require('axios');
    const qs = require('qs');

    /**
     * Import of the config file containing the BOT data
     */
    const config = require('../config');

    /**
     * Function to send embeds on discord
     */
    const embed = require('../embed');

    /**
     * If the command is not called, then end the function
     */
    if (m.command !== "call" && m.command !== "calltest") return false;

    /**
     * If the command does not contain 2 arguments, end the function and return an error
     */
    if(m.args.length < 2) return embed(m.message, 'Need more arguments', 15158332, 'You need to give 2 arguments, example : **!call 33612345678 paypal**', m.user);
    
    /**
     * If the phone number or service does not match the regex, then return an error
     */
    if(!m.args['0'].match(/^\d{8,14}$/g)) return embed(m.message, 'Bad phone number', 15158332, 'This phone number is not good, a good one : **33612345678**', m.user);
    if(!m.args['1'].match(/[a-zA-Z]+/gm)) return embed(m.message, 'Bad service name', 15158332, 'This service name is not good, a good one : **paypal**', m.user);
    
    /**
     * If the command is! Calltest then we switch to a test call with the user test
     */
    m.user = m.command == "calltest" ? 'test' : m.user;
    m.args['2'] = m.args['2'] == undefined ? '' : m.args['2'];

    /**
     * If all the conditions have been met, then send a request to the call API
     */
    axios.post(config.apiurl + '/call/', qs.stringify({
        password: config.apipassword,
        to: m.args['0'],
        user: m.user,
        service: m.args['1'].toLowerCase(),
        name: m.args['2'].toLowerCase() || null
    }))
    .catch(error => {
        console.error(error)
    })

    /**
     * Answer saying that the call api has been passed
     */
    return embed(m.message, 'Call sent', 3066993, 'The api call has been sent to **' + m.args['0'] + '** using **' + m.args['1'] + '** service.', m.user)
}