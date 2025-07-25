const Config = require('../config')
const RcsUtils = require('./rcs_utils');
const Utils = require('./utils');
const WEBHOOK = Config.data.WEBHOOK + '/webhook'

async function respondTo(inbound, res) {

    //  Analyse code lowercase
    let codeLowerCase = null;
    
    if (inbound.text) {
        console.log('Code is in text');
        codeLowerCase = inbound.text.toLowerCase();
    } 
    else if (inbound.replyId) {
        console.log('Code is in reply id');
        codeLowerCase = inbound.replyId;
    }

    console.log('Code: ', codeLowerCase)
    console.log('inbound.imageUrl: ', inbound.imageUrl)

    if (!codeLowerCase && !inbound.imageUrl) {
        return res.status(200).json({ success: false });
    }

    if (inbound.imageUrl) {
        ReadBusinessCard(inbound, res)
    }
    else {
        const exactMatches = {
            'bt': BT,
            't&s': TandS,
            'rc': RC,
            'rcc': RCC,
        };    
        const patternMatches = [
            //  LATE FLIGHT - REBOOK FLOW
            {
                condition: (code) => code.startsWith('lf '),
                handler: LF,
            },
            {
                condition: (code) => code === 'lf_rebook_am',
                handler: LF_rebook_am,
            },
            {
                condition: (code) => code === 'lf_rebook_pm',
                handler: LF_rebook_pm,
            },
            {
                condition: (code) => code === 'lf_rebook_evening',
                handler: LF_rebook_evening,
            },
            {
                condition: (code) => code === 'lf_rebook_flex',
                handler: LF_rebook_flex,
            },
            {
                condition: (code) => code.startsWith('lf_rebook_'),
                handler: LF_rebook,
            },
            {
                condition: (code) => ['flight_123', 'flight_456'].includes(code),
                handler: LF_rebook_flight_seelcted,
            },
            //  BOOK LOUNGE
            {
                condition: (code) => code === 'lf_book_transp',
                handler: LF_rebook_book_transport,
            },
            {
                condition: (code) => code === 'lf_email_det',
                handler: LF_rebook_email_details,
            },
            {
                condition: (code) => code === 'lf_im_good',
                handler: LF_rebook_im_good,
            },
            //  LATE FLIGHT - LOUNGE ACCESS FLOW
            {
                condition: (code) => code === 'lf_lounge_no',
                handler: LF_lounge_no,
            },
            {
                condition: (code) => code === 'lf_lounge_yes',
                handler: LF_lounge_yes,
            },
            {
                condition: (code) => code === 'lf_lounge_e',
                handler: LF_lounge_selection_common,
            },
            {
                condition: (code) => code === 'lf_lounge_qw',
                handler: LF_lounge_selection_common,
            },
            {
                condition: (code) => code === 'lf_lounge_fad',
                handler: LF_lounge_selection_common,
            },
            {
                condition: (code) => code.startsWith('lf_lounge_access_'),
                handler: LF_lounge_access,
            },
            //  FLIGHT SERVICE
            {
                condition: (code) => code.startsWith('fssetnomeal_'),
                handler: FS_no_meal_selected,
            },
            {
                condition: (code) => code.startsWith('fssetfoodfish_'),
                handler: FS_confirm_meal,
            },
            {
                condition: (code) => code.startsWith('fssetfoodchicken_'),
                handler: FS_confirm_meal,
            },
            {
                condition: (code) => code.startsWith('fssetfoodveg_'),
                handler: FS_confirm_meal,
            },
            {
                condition: (code) => code === 'fs_select_legs',
                handler: FS_upgrade_seats_selected,
            },
            {
                condition: (code) => code === 'fs_select_quiet',
                handler: FS_upgrade_seats_selected,
            },
            {
                condition: (code) => code.startsWith('fsnothanks_'),
                handler: FS_no_thanks,
            },
            {
                condition: (code) => code.startsWith('fssetfoodprefs_'),
                handler: FS_set_food_prefs,
            },
            {
                condition: (code) => code.startsWith('fsupgradeseats_'),
                handler: FS_upgrade_seats,
            },
            {
                condition: (code) => code.startsWith('fs '),
                handler: FS,
            },
    
        ];
            
        if (exactMatches[codeLowerCase]) {
            await exactMatches[codeLowerCase](inbound, res);
        } else {
            for (const { condition, handler } of patternMatches) {
                if (condition(codeLowerCase)) {
                    await handler(inbound, res);
                    break;
                }
            }
        }
    }

}



/**
 * FLIGHT SERVICES - REJECTS AND ENDS
 * @param {*} inbound 
 * @param {*} res 
 */
async function FS_no_thanks(inbound, res) {
    const a = inbound.replyId.split('_')
    const name = a.length >= 2 ? a[3] : '';
    const text = `That's fine, ${name}.
    
Let us know if you’d like any other assistance`
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response)
    })
}


function ReadBusinessCard(inbound, res) {
    const imageUrl = inbound.imageUrl;

    if (imageUrl) {
        //  User is sending a scan of a card
        const Tesseract = require('tesseract.js');
        Tesseract.recognize(
            imageUrl,
            'eng'
        ).then(({ data: { text } }) => {
            console.log('Extracted text:', text);
            const agent = `This is the information we received:

${text}`;
            RcsUtils.sendRCSText(inbound.phone, agent, null, (response) => {
                res.status(200).json(response)
            })    
        }).catch(err => {
            console.error('Error:', err);
            const agent = `Apologies, I wasn't able to extract the information from your card. Could you kindly send me a better picture or just type the details?`;
            RcsUtils.sendRCSText(to, agent, null, (response) => {
                res.status(200).json(response)
            })    
        });
    } 
    else {
        res.status(200).json(response)
    }
}


/**
 * FLIGHT SERVICES - NO MEAL WANTED
 * @param {*} inbound 
 * @param {*} res 
 */
async function FS_no_meal_selected(inbound, res) {
    const a = inbound.replyId.split('_')
    const name = a.length >= 2 ? a[1] : '';
    const text = `That's fine, ${name}.
    
Let us know if you’d like any other assistance`
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response)
    })
}

/**
 *  * FLIGHT SERVICES - CONFIRM MEAL
 * @param {*} inbound 
 * @param {*} res 
 */
async function FS_confirm_meal(inbound, res) {
    const a = inbound.replyId.split('_')
    const name = a.length >= 2 ? a[1] : '';
    const text = `Thanks, ${name}. Your meal preference has been recorded.
You can update it anytime before check-in.
    `
}

/**
 * FLIGHT SERVICES - FOOD PREFERENCES IS SELECTED
 * @param {*} inbound 
 * @param {*} res 
 */
async function FS_set_food_prefs(inbound, res) {
    const a = inbound.replyId.split('_')
    const name = a.length >= 2 ? a[1] : '';

    const cards = [
        {
            "title": "Vegetarian",
            "description": "Tap the button to select the vegetarian option",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/vegetarian.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Select",
                        "postbackData": "fssetfoodveg_" + name,
                    }
                },
            ],
        },
        {
            "title": "Chicken",
            "description": "Tap this button to select chicken",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/chicken.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Select",
                        "postbackData": "fssetfoodchicken_" + name
                    }
                }
            ],
        },
        {
            "title": "Fish",
            "description": "Tap this button to select the fish option",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/fish.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Select",
                        "postbackData": "fssetfoodfish_" + name
                    }
                }
            ],
        },
        {
            "title": "No meal",
            "description": "Tap the button below if you don't want meal in your flight",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/nomeal.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Select",
                        "postbackData": "fssetnomeal_" + name
                    }
                }
            ],
        },
    ]
    RcsUtils.sendRCSCarousel(inbound.phone, cards, null, (response) => {
        res.status(200).json(response)
    })
}



/**
 * FLIGHT SERVICE - USER CONFIRMS THE NEW SEATS
 * @param {*} inbound 
 * @param {*} res 
 */
async function FS_upgrade_seats_selected(inbound, res) {
    const text = `Great choice! We've reserved your upgraded seat.

A payment link has been sent to your email to complete the booking.
Let us know if you'd like any other assistance.
    `;
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response)
    })
}

/**
 * FLIGHT SERVICES - UPGRADE SEATS
 * @param {*} inbound 
 * @param {*} res 
 */
async function FS_upgrade_seats(inbound, res) {
    const cards = [
        {
            "title": "Extra legroom – £25",
            "description": "Upgrade to a seat at the front row with more space for your legs.",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/extra_legroom.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Select",
                        "postbackData": "fs_select_legs"
                    }
                }
            ],
        },
        {
            "title": "Window + quiet zone – £30",
            "description": "Upgrade to our exclusive quiet zone",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/quiet_zone.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Select",
                        "postbackData": "fs_select_quiet"
                    }
                }
            ],
        },
    ]
    RcsUtils.sendRCSCarousel(inbound.phone, cards, null, (response) => {
        res.status(200).json(response)
    })
}

async function FS(inbound, res) {
    const a = inbound.text.split(' ');
    const name = a.length >= 2 ? a[1] : '';

    const text = `Hi, ${name}

Your flight VON-123 is confirmed! Would you like to:
`;
    const buttons = [
        {
            "reply": {
                "text": "Upgrade Your Seat",
                "postbackData": "fsupgradeseats_" + name,
            }
        },
        {
            "reply": {
                "text": "Set Food Preferences",
                "postbackData": "fssetfoodprefs_" + name,
            }
        },
        {
            "reply": {
                "text": "No, thanks",
                "postbackData": "fsnothanks_" + name,
            }
        },
    ]
    RcsUtils.sendRCSButtons(inbound.phone, text, buttons, null, (response) => {
        res.status(200).json(response)
    })
}


/**
 * Lounge Access - Don't send reminder before departure
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_lounge_no(inbound, res) {
    const text = `No problem. Your lounge access is confirmed.
Let us know if you’d like any other assistance while you wait.`;
    
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response);
    })
}

/**
 * Lounge Access - Send remunder before departure
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_lounge_yes(inbound, res) {
    const text = `Great! We’ll send you a boarding reminder 30 minutes before departure.
Enjoy the lounge, and don’t hesitate to reach out if you need anything.`;
    
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response);
    })
}

/**
 * Lounge Access - Respond to any of the selected options of place wanted
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_lounge_selection_common(inbound, res) {
    const card = {
        "title": "Thanks! We’ve reserved a spot for you at:",
        "description": `- SkyPort Lounge
- Access: From now until departure
- Includes: Food, drinks, Wi-Fi, and comfortable seating
📍 Location: Terminal 2, near Gate 14

You’ll receive a QR code shortly for entry.
Would you like a reminder 30 minutes before boarding?        
        `,
        "media": {
            "height": "TALL",
            "contentInfo": {
                "fileUrl": Config.data.SERVER + "/lounge_access.png",
                "forceRefresh": "false"
            }
        },
        "suggestions": [
            {
                "reply": {
                    "text": "Yes, please",
                    "postbackData": "lf_lounge_yes",
                }
            },
            {
                "reply": {
                    "text": "No, thank you",
                    "postbackData": "lf_lounge_no",
                }
            },
        ]
    }
    RcsUtils.sendRCSCard(inbound.phone, card, null, (response) => {
        res.status(200).json(response)
    })    
}

/**
 * Lounge Access - Starts here
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_lounge_access(inbound, res) {
    const a = inbound.replyId.split('_')
    const name = a.length >= 2 ? a[3] : '';

    const text = `We’d be happy to help you relax while you wait, ${name}.
Would you prefer a lounge with food & drinks or one with a quiet workspace?`;

    const buttons = [
        {
            "reply": {
                "text": "Food & Drinks",
                "postbackData": "lf_lounge_fad",
            }
        },
        {
            "reply": {
                "text": "Quiet Workspace",
                "postbackData": "lf_lounge_qw",
            }
        },
        {
            "reply": {
                "text": "Either is fine",
                "postbackData": "lf_lounge_e",
            }
        },
    ]
    RcsUtils.sendRCSButtons(inbound.phone, text, buttons, null, (response) => {
        res.status(200).json(response);
    })
}



/**
 * Late Flight - Rebook in the AM
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_am(inbound, res) {
    await LF_rebook_time('am', inbound, res)
}

/**
 * Late Flight - Rebook in the PM
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_pm(inbound, res) {
    await LF_rebook_time('pm', inbound, res)
}

/**
 * Late Flight - Rebook in the Evening
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_evening(inbound, res) {
    await LF_rebook_time('evening', inbound, res)
}

/**
 * Late Flight - Rebook flexible
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_flex(inbound, res) {
    await LF_rebook_time('flex', inbound, res)
}

/**
 * Late Flight - Rebook - Common function for all times
 * @param {*} time 
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_time(time, inbound, res) {
    const timeSelected = time == 'am' ? 'morning' : time == 'pm' ? 'afternoon' : 'evening';
    let text = `Great. We’re checking for flights departing in the ${timeSelected}.

One moment...
`;
    if (time == 'flex') {
        text = `Thanks. We’ll show you the best available flights today.

Please hold while we search...
`;
    }
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response);
        setTimeout( async () => {
            await LF_rebook_final_result(inbound);
        }, 7 * 1000)
    })
}

/**
 * Late Flight - Select Flight
 * @param {*} inbound 
 */
async function LF_rebook_final_result(inbound) {
    let text = `Here are available options:`;
    const buttons = [
        {
            "reply": {
                "text": "Flight 123",
                "postbackData": "flight_123",
            }
        },
        {
            "reply": {
                "text": "Flight 456",
                "postbackData": "flight_456",
            }
        },
    ]
    RcsUtils.sendRCSButtons(inbound.phone, text, buttons, null, (response) => {
        console.log('Result already sent to Vonage server')
    })
}

/**
 * Late Flight - Book transport after book selected?
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_flight_seelcted(inbound, res) {
    const flightName = inbound.replyId == 'flight_123' ? 'Flight 123' : 'Flight 456'
    let text = `You're all set!

Your flight has been rebooked to ${flightName}, departing at 08:10
We’ve sent your updated itinerary to your email.
Would you like help arranging transport to the airport?
`;
    const buttons = [
        {
            "reply": {
                "text": "Yes, book transport",
                "postbackData": "lf_book_transp",
            }
        },
        {
            "reply": {
                "text": "Email me the details",
                "postbackData": "lf_email_det",
            }
        },
        {
            "reply": {
                "text": "No, I'm good",
                "postbackData": "lf_im_good",
            }
        },
    ]
    RcsUtils.sendRCSButtons(inbound.phone, text, buttons, null, (response) => {
        res.status(200).json(response);
    })
}

/**
 * Late Flight - Book transport
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_book_transport(inbound, res) {
    let text = `Transport Confirmed

A private transport under your name will arrive outside the arrivals area.

- Driver’s Name: Carlos Mendes
- Plate Number: RWA-756G

You’ll receive a message when the vehicle is nearby.

Safe travels! Let us know if you need anything else.
    `;
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response);
    })
}

/**
 * Late Flight - Book transport - Email details
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_email_details(inbound, res) {
    let text = `Perfect. An Email with all the details for booking a transport should be in your Inbox.
    
    Safe travels! Let us know if you need anything else.
        `;
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response);
    })
}

/**
 * Late Flight - Book transport - I'm good
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook_im_good(inbound, res) {
    let text = `No problem. 
    
    Safe travels! Let us know if you need anything else.
    `;
    RcsUtils.sendRCSText(inbound.phone, text, null, (response) => {
        res.status(200).json(response);
    })
}

/**
 * REBOOK: Select time of the day
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF_rebook(inbound, res) {
    const a = inbound.replyId.split('_');
    const name = a.length >= 2 ? a[2] : '';

    const text = `Thanks, ${name}. Let’s help you find a new flight.

Can you please confirm your preferred departure time or let me know if you're flexible with travel times?
`;
    const buttons = [
        {
            "reply": {
                "text": "Morning",
                "postbackData": "lf_rebook_am",
            }
        },
        {
            "reply": {
                "text": "Afternoon",
                "postbackData": "lf_rebook_pm",
            }
        },
        {
            "reply": {
                "text": "Evening",
                "postbackData": "lf_rebook_evening",
            }
        },
        {
            "reply": {
                "text": "I'm flexible",
                "postbackData": "lf_rebook_flex",
            }
        },
    ]
    RcsUtils.sendRCSButtons(inbound.phone, text, buttons, null, (response) => {
        res.status(200).json(response)
    })
}


/**
 * Late Flight
 * @param {*} inbound 
 * @param {*} res 
 */
async function LF(inbound, res) {
    const a = inbound.text.split(' ');
    const name = a.length >= 2 ? a[1] : '';

    const text = `Hi, ${name}

We wanted to let you know that your flight VON-345 has been delayed.
We’re sorry for the inconvenience and will share the new departure time soon.

Would you like assistance with rebooking or airport lounge access?
`;
    const buttons = [
        {
            "reply": {
                "text": "Rebook",
                "postbackData": "lf_rebook_" + name,
            }
        },
        {
            "reply": {
                "text": "Lounge Access",
                "postbackData": "lf_lounge_access_" + name,
            }
        },
        {
            "reply": {
                "text": "No, thanks",
                "postbackData": "lf_no_thanks_" + name,
            }
        },
    ]
    RcsUtils.sendRCSButtons(inbound.phone, text, buttons, null, (response) => {
        res.status(200).json(response)
    })
}


/**
 * RCS Branded Text
 * @param {*} inbound 
 * @param {*} res 
 */
async function BT(inbound, res) {
    const text = `✈️ Welcome aboard with Vonage Airlines!

We’re excited to have you flying with us.
Check your flight details here: https://vonage.com

Travel smart. Travel Vonage.  
    `
    SendRCSText(inbound.phone, text, (response) => {
        res.status(200).json(response)
    });
}

/**
 * RCS Text & Suggestions
 * @param {*} inbound 
 * @param {*} res 
 */
async function TandS(inbound, res) {
    const text = `✈️ Welcome aboard with Vonage Airlines!

We’re excited to have you flying with us.
Tap below to check your flight details.
`;
    const buttons = [
        {
            "action": {
                "text": "View My Trip",
                "postbackData": "view_my_trip",
                "openUrlAction": {
                    "url": "https://vonage.com"
                }
            }
        },
        {
            "reply": {
                "text": "Tell me more",
                "postbackData": "tell_me_more",
            }
        },
    ]
    RcsUtils.sendRCSButtons(inbound.phone, text, buttons, null, (response) => {
        res.status(200).json(response)
    })
}

/**
 * RCS Rich Card
 * @param {*} inbound 
 * @param {*} res 
 */
async function RC(inbound, res) {
    const card = {
        "title": "✈️ Welcome aboard with Vonage Airlines!",
        "description": "We’re excited to have you flying with us. Tap below to check your flight details.",
        "media": {
            "height": "TALL",
            "contentInfo": {
                "fileUrl": Config.data.SERVER + "/welcome.png",
                "forceRefresh": "false"
            }
        },
        "suggestions": [{
            "reply": {
                "text": "View My Trip",
                "postbackData": "view_my_trip_from_card"
            }
        }]
    }
    RcsUtils.sendRCSCard(inbound.phone, card, null, (response) => {
        res.status(200).json(response)
    })
}

/**
 * RCS Rich Card Carousel
 * @param {*} inbound 
 * @param {*} res 
 */
async function RCC(inbound, res) {
    const cards = [
        {
            "title": "Track Your Baggage",
            "description": "Stay updated on your bag’s location from check-in to arrival.",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/track_bagage.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "action": {
                        "text": "Track",
                        "postbackData": "track_baggage",
                        "openUrlAction": {
                            "url": "https://vonage.com/track-bag"
                        }
                    }
                },
            ],
        },
        {
            "title": "Real-Time Flight Updates",
            "description": "Check departure times, gate info, and delays instantly.",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/real_time_flight_updates.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "View Status",
                        "postbackData": "view_status"
                    }
                }
            ],
        },
        {
            "title": "Choose Your Meal",
            "description": "Select your preferred in-flight meal in advance.",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/choose_your_meal.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Menu",
                        "postbackData": "meal_menu"
                    }
                }
            ],
        },
        {
            "title": "Seat Upgrade Available",
            "description": "reat yourself to more legroom or a window view.",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/seat_upgrade_available.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Upgrade Seats",
                        "postbackData": "manage_seats"
                    }
                }
            ],
        },
        {
            "title": "Talk to Support",
            "description": "Our support team is ready to assist you anytime.",
            "media": {
                "height": "MEDIUM",
                "contentInfo": {
                    "fileUrl": Config.data.SERVER + "/talk_to_support.png",
                    "forceRefresh": "false"
                }
            },
            "suggestions": [
                {
                    "reply": {
                        "text": "Chat Now",
                        "postbackData": "chat_now"
                    }
                }
            ],
        },
    ]
    RcsUtils.sendRCSCarousel(inbound.phone, cards, null, (response) => {
        res.status(200).json(response)
    })
}

//
//  COMMON FUNCTIONS
//

function SendRCSText(to, message, callback) {
    RcsUtils.sendRCSText(to, message, WEBHOOK, callback)
}

function SendRCSTextWithCustomWebhooks(to, message, webkook_url, callback) {
    RcsUtils.sendRCSText(to, message, webkook_url, callback)
}


module.exports = {
    SendRCSText,
    SendRCSTextWithCustomWebhooks,
    respondTo,
}




