const { Server } = require("socket.io");
const { SOCKET_EVENTS, REDIS_CHANNELS, MessageStatus } = require("../constant");
const { Redis } = require("ioredis");
const { produceMessage, startMessageConsumer, updateMessageStatus } = require("./kafka");
const { generateConversationId } = require("../helper/helper");

class SocketSerice {
    #io;
    #pub = undefined;
    #sub = undefined;
    #cacheStorage = {};
    constructor() {
        console.log("Init Redis and socket service...");
        this.#io = new Server();
        this.#initRedisConnections();
    }

    #initRedisConnections() {
        try {
            console.log("Connecting to Redis...");
            this.#pub = new Redis({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                username: process.env.REDIS_USERNAME,
                password: process.env.REDIS_PASSWORD,
            });

            this.#sub = new Redis({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                username: process.env.REDIS_USERNAME,
                password: process.env.REDIS_PASSWORD,
            });

            console.log("Redis connections established.");
        } catch (error) {
            console.error("Error connecting to Redis:", error.message);
        } finally {
            try {
                this.#initListeners();
            } catch (error) {
                console.log(error.message);
            }
        }
    }

    async #initListeners() {
        if (this.#pub === undefined || this.#sub === undefined) {
            console.log('Redis connections not established.Socket server not initialized.');
            return;
        }
        startMessageConsumer();
        this.#sub.subscribe(REDIS_CHANNELS.MESSAGES);
        this.#sub.subscribe(REDIS_CHANNELS.USER_STATUS);
        this.#sub.subscribe(REDIS_CHANNELS.MESSAGE_STATUS);

        const io = this.#io;

        console.log('Init socket listeners...');
        io.on(SOCKET_EVENTS.CONNECT, socket => {
            console.log('New socket connected', socket.id);

            socket.on(SOCKET_EVENTS.USER_STATUS, async (data) => {
                // uid    
                console.log('online')
                let status = {
                    uid: data.uid,
                    socketID: socket.id,
                    online: true
                }
                this.#cacheStorage[socket.id] = data.uid
                await this.#pub.publish(REDIS_CHANNELS.USER_STATUS, JSON.stringify(status));
            });

            socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
                // toUID | fromUID | message | createdAt
                console.log('new message received', data.message);
                await this.#pub.publish(REDIS_CHANNELS.MESSAGES, JSON.stringify(data));
            })

            socket.on(SOCKET_EVENTS.MESSAGE_STATUS, async (data) => {
                // toUID | conversationId | status
                await this.#pub.publish(REDIS_CHANNELS.MESSAGE_STATUS, JSON.stringify(data));
            })

            socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
                let uid = this.#cacheStorage[socket.id];
                await this.#pub.publish(REDIS_CHANNELS.USER_STATUS, JSON.stringify({ uid: uid, socketID: socket.id, online: false }));
                console.log('Socket disconnected', socket.id);
            });

        });

        this.#sub.on('message', async (channel, message) => {
            console.log(channel);
            switch (channel) {
                case REDIS_CHANNELS.MESSAGES:
                    // toUID | fromUID | message | createdAt | status
                    let parseMessage = await JSON.parse(message);
                    io.emit(parseMessage.toUID, parseMessage);
                    if (this.#isUserOnline(parseMessage.toUID)) {
                        parseMessage.status = MessageStatus.delivered;
                        io.emit('statusUpdate-' + parseMessage.fromUID, { conversationId: generateConversationId(parseMessage.fromUID, parseMessage.toUID), status: MessageStatus.delivered });
                    }
                    await produceMessage(JSON.stringify(parseMessage));
                    break;

                case REDIS_CHANNELS.USER_STATUS:
                    // uid | socketID | online
                    let data = await JSON.parse(message);
                    if (data.online) {
                        this.#cacheStorage[data.uid] = data.socketID;
                        this.#cacheStorage[data.socketID] = data.uid;
                    } else {
                        delete this.#cacheStorage[data.uid];
                        delete this.#cacheStorage[data.socketID];
                    }
                    console.log(this.#cacheStorage);
                    break;

                case REDIS_CHANNELS.MESSAGE_STATUS:
                    // toUID | conversationId | status
                    let messageStatus = await JSON.parse(message);
                    if (this.#isUserOnline(messageStatus.toUID)) {
                        io.emit('statusUpdate-' + messageStatus.toUID, { conversationId: messageStatus.conversationId, status: messageStatus.status });
                    }
                    await updateMessageStatus(JSON.stringify(messageStatus));
                    break;

                default:
                    break;
            }
        });
    }

    #isUserOnline(uid) {
        if (this.#cacheStorage[uid] === undefined) {
            return false;
        }
        return this.#cacheStorage[uid];
    }
    get io() {
        return this.#io;
    }
}

module.exports = SocketSerice;