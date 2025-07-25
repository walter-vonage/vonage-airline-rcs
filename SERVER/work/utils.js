function parseInbound(data) {
    try {
        if (data.status) {
            return null;
        }
        const phone = data.from;
        const message_type = data.message_type ? data.message_type : null;
        const text = data.text ? data.text : null;
        let imageUrl = null;
        let replyId = null;
        let replyTitle = null;
        let location = null;
        if (message_type == 'image') {
            imageUrl = data.image.url;
        }
        if (message_type == 'location') {
            location = data.location;
        }
        if (data.reply) {
            replyId = data.reply.id;
            replyTitle = data.reply.title;
        }
        return {
            to: data.to,
            phone,
            message_type,
            text,
            imageUrl,
            location,
            replyId,
            replyTitle
        }
    } catch (ex) {
        console.log(ex.message);
        return null;
    }
}

function giveMeRandomReason() {
    const fallbackResponses = [
        "Sorry, I didn’t quite get that. Could you rephrase it?",
        "Hmm... that doesn’t seem related...",
        "I didn't get that. I’m here to help with insurance claims.",
        "I didn’t understand that...",
        "Sorry, but I don't understand this.."
    ];
    // Pick a random one
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return randomResponse;
}


async function reverseGeocode(lat, lon) {
    const axios = require('axios');
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'VonageDemoRCS/1.0 (contact: walter.rodriguez@vonage.com)'
          }          
    });
    if (response && response.data && response.data.display_name) {
        console.log(response.data);
        return response.data.display_name;
    } else {
        return null;
    }
}

module.exports = {
    parseInbound,
    giveMeRandomReason,
    reverseGeocode,
}