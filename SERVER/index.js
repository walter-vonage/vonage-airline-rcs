const Config = require('./config')
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.VCR_PORT || 3000;

app.use(bodyParser.json());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

const RcsUtils = require('./work/rcs_utils');
const Utils = require('./work/utils');
const Flow = require('./work/flow');

const CONVERSATION = require('./work/conversations')
const WEBHOOK = Config.data.WEBHOOK + '/webhook'

app.get('/test', async (req, res) => {
    RcsUtils.sendRCSText('447375637447', 'Hey there', null, () => {
        res.status(200).json({
            success: true,
            message: 'This is test'
        })
    })
})

/**
 * WEBHOOK
 */
app.post('/webhook', async (req, res) => {    
    try {
        // console.log('BODY', req.body)
        if (!req.body) {
            return res.status(200).json({
                success: false,
                message: 'No body'
            })
        }
        

        //  Parse the inbound message and be ready for anything
        const inbound = Utils.parseInbound(req.body);
        if (!inbound) {
            return res.status(200).json({
                success: false,
                message: 'Invalid inbound'
            })
        }
        
        if (inbound.to != Config.data.FROM) {
            return res.status(200).json({
                success: false,
                message: 'This RCS is not targeted to this Sender ID: ' + Config.data.FROM
            })
        }

        //
        //  GET THE CONVERSATION STATUS FOR THIS USER
        //
        const conversationStatus = CONVERSATION.getConversationStatus(inbound.phone);
        console.log('CONVERSATION: ', conversationStatus)

        await Flow.respondTo(inbound, res)

    } catch(ex) {
        console.log(ex.message)
        res.status(200).json({
            success: false,
            message: ex.message
        })    
    }
})



/**
 * Check system health
 */
app.get('/_/health', async (req, res) => {
    res.sendStatus(200);
});

/**
 * VCR calls this to show metrics related stuff
 */
app.get('/_/metrics', async (req, res) => {
    res.sendStatus(200);
});

/**
 * Listen
 */
app.listen(port, () => {
    console.log(`Server running on PORT ${port}`);
    console.log('This url: ' + Config.data.SERVER);
});
