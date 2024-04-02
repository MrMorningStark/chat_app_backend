const COLLECTION_NAME = {
    USERS: "users",
    CHATS: "chats",
    MESSAGES: "messages",
    ROOMS: "rooms",
    CONVERSATIONS: "conversations",
}

const SOCKET_EVENTS = Object.freeze({
    CONNECT: "connect",
    INITIATE_CHAT: "initiateChat",
    LEAVE_CHAT: "leaveChat",
    SEND_MESSAGE: "sendMessage",
    USER_STATUS: "userStatus",
    MESSAGE_STATUS: "messageStatus",
});

const REDIS_CHANNELS = Object.freeze({
    MESSAGES: "messages",
    USER_STATUS: "userStatus",
    MESSAGE_STATUS: "messageStatus",
})

const KAFKA_TOPICS = Object.freeze({
    MESSAGES: "messages",
    MESSAGE_STATUS: "messageStatus",
})

const MessageStatus = Object.freeze({
    sent: 0,
    delivered: 1,
    read: 2,
});

module.exports = {
    COLLECTION_NAME, SOCKET_EVENTS, REDIS_CHANNELS, KAFKA_TOPICS, MessageStatus
}