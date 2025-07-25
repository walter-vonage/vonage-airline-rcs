const CONVERSATIONS = []

function isNumberInConversation(phone) {
    const index = CONVERSATIONS.findIndex((i) => i.phone == phone);
    return (index == -1) ? false : true
}

function startConversation(phone, status, lastMessage) {
    const index = CONVERSATIONS.findIndex((i) => i.phone == phone);
    if (index > -1) {
        CONVERSATIONS[ index ].status = status;
    } else {
        CONVERSATIONS.push({
            phone,
            status,
            lastMessage
        })
    }
}

function removeConversation(phone) {
    const index = CONVERSATIONS.findIndex((i) => i.phone == phone);
    if (index > -1) {
        CONVERSATIONS.splice(index, 1);
    }
}

function getConversationStatus(phone) {
    const index = CONVERSATIONS.findIndex((i) => i.phone == phone);
    if (index > -1) {
        return CONVERSATIONS[index].status
    } else {
        return null
    }
}

function setConversationStatus(phone, status) {
    const index = CONVERSATIONS.findIndex((i) => i.phone == phone);
    if (index > -1) {
        CONVERSATIONS[index].status = status
        console.log('STATUS CHANGED TO ' + status + ' FOR ' + phone)
        return true;
    } else {
        console.log('STATUS ***** NOT CHANGED ***** CHANGED TO ' + status + ' FOR ' + phone)
        return false
    }
}

function getConversation(phone) {
    const index = CONVERSATIONS.findIndex((i) => i.phone == phone);
    if (index > -1) {
        return CONVERSATIONS[index]
    } else {
        return null
    }
}

module.exports = {
    isNumberInConversation,
    startConversation,
    removeConversation,
    getConversationStatus,
    getConversation,
    setConversationStatus
}
