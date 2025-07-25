const axios = require('axios');
const Config = require('../config')
const { tokenGenerate } = require('@vonage/jwt')
const privateKey = process.env.VCR_PRIVATE_KEY;
const applicationId = process.env.VCR_API_APPLICATION_ID;

function sendRCSText(to, message, webhook_url, callback) {
    const from = Config.data.FROM;
    if (!from || !to) {
        console.log('sendRCSText - Returning false')
        callback({
            success: false,
            message: 'Invalid data'
        })
        return false;
    }
    let data = JSON.stringify({
        "message_type": "text",
        "text": message,
        "to": to,
        "from": from,
        "channel": "rcs"
    });
    if (webhook_url) {
        data = JSON.stringify({
            "message_type": "text",
            "text": message,
            "to": to,
            "from": from,
            "channel": "rcs",
            "webhook_url": webhook_url
        });
    }
    sendRCS(data, callback);
}

function sendRCSButtons(to, message, buttons, webhook_url, callback) {
    const from = Config.data.FROM;
    if (!from || !to || !message) {
        return false;
    }
    let data = JSON.stringify({
        "message_type": "custom",
        "custom": {
            "contentMessage": {
                "text": message,
                "suggestions": buttons
            }
        },
        "to": to,
        "from": from,
        "channel": "rcs",
        "webhook_url": webhook_url
    });
    sendRCS(data, callback);
}

function sendRCSCard(to, card, webhook_url, callback) {
    const from = Config.data.FROM;
    if (!from || !to) {
        callback({
            success: false,
            message: 'Invalid data'
        })
        return false;
    }
    let data = JSON.stringify({
        "message_type": "custom",
        "custom": {
            "contentMessage": {
                "richCard": {
                    "standaloneCard": {
                        "thumbnailImageAlignment": "LEFT",
                        "cardOrientation": "VERTICAL",
                        "cardContent": card
                    }
                }
            }
        },
        "to": to,
        "from": from,
        "channel": "rcs",
        "webhook_url": webhook_url
    });
    sendRCS(data, callback);
}

function sendRCSCarousel(to, cards, webhook_url, callback) {
    const from = Config.data.FROM;
    if (!from || !to) {
        callback({
            success: false,
            message: 'Invalid data'
        })
        return false;
    }
    let data = JSON.stringify({
        "message_type": "custom",
        "custom": {
            "contentMessage": {
                "richCard": {
                    "carouselCard": {
                        "cardWidth": "MEDIUM",
                        "cardContents": cards
                    }
                }
            }
        },
        "to": to,
        "from": from,
        "channel": "rcs",
        "webhook_url": webhook_url
    })
    sendRCS(data, callback);
}


function sendLocationShareRequest(to, message, webhook_url, callback) {
    const from = Config.data.FROM;
    if (!from || !to) {
        callback({
            success: false,
            message: 'Invalid data'
        })
        return false;
    }
    let data = JSON.stringify({
        "message_type": "custom",
        "custom": {
            "contentMessage": {
                "text": message,
                "suggestions": [
                    {
                        "action": {
                            "text": "Share your location",
                            "postbackData": "location_data",
                            "shareLocationAction": {}
                        }
                    }
                ]
            }
        },
        "to": to,
        "from": from,
        "channel": "rcs",
        "webhook_url": webhook_url
    })
    sendRCS(data, callback);
}


//
//  INTERNAL
//
function sendRCS(data, callback) {
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.nexmo.com/v1/messages',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + generateToken()
            },
            data
        };
        axios.request(config).then((response) => {
            console.log(JSON.stringify(response.data));
            callback({
                success: true,
                data: response.data
            })
        }).catch((error) => {
            console.log(error.message);
            callback({
                success: false,
                message: error.message
            })
        });
    } catch(ex) {
        console.log(ex.message);
        callback({
            success: false,
            message: ex.message
        })
    }
}

const generateToken = () => {
    return tokenGenerate(applicationId, privateKey, {
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours
    })
}

module.exports = {
    sendRCSText,
    sendRCSButtons,
    sendRCSCard,
    sendRCSCarousel,
    sendLocationShareRequest,
}

