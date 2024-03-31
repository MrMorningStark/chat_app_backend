const COLLECTION_NAME = {
    USERS: "users",
}

const SOCKET_EVENTS = Object.freeze({
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    INITIATE_CHAT: "initiateChat",
    CHAT_INITIATED: "chatInitiated",
    LEAVE_CHAT: "leaveChat",
    JOIN_ROOM: "joinRoom",
    SEND_MESSAGE: "sendMessage",
    RECEIVE_MESSAGE: "receiveMessage",
    MESSAGE_RECEIVED: "messageReceived",
    USER_ONLINE: "userOnline",
    USER_OFFLINE: "userOffline",
    USER_TYPING: "userTyping",
    USER_STOP_TYPING: "userStopTyping",
    USER_INACTIVE: "userInactive",
});

const REDIS_CHANNELS = Object.freeze({
    MESSAGES: "messages",
})

module.exports = {
    COLLECTION_NAME, SOCKET_EVENTS, REDIS_CHANNELS
}