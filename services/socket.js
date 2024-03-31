const { Server } = require("socket.io");
const { SOCKET_EVENTS, REDIS_CHANNELS } = require("../constant");
const { Redis } = require("ioredis");
const { produceMessage, startMessageConsumer } = require("./kafka");

class SocketSerice {
    #io;
    #pub = undefined;
    #sub = undefined;
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
            console.error("Error connecting to Redis:", error);
        } finally {
            this.#initListeners();
        }
    }

    async #initListeners() {
        if (this.#pub === undefined || this.#sub === undefined) {
            console.log('Redis connections not established.Socket server not initialized.');
            return;
        }
        startMessageConsumer();
        this.#sub.subscribe(REDIS_CHANNELS.MESSAGES);
        const io = this.#io;
        console.log('Init socket listeners...');
        io.on(SOCKET_EVENTS.CONNECT, socket => {
            console.log('New socket connected', socket.id);

            socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
                // toUID | fromUID | message | createdAt
                console.log('new message received', data.message);
                await this.#pub.publish(REDIS_CHANNELS.MESSAGES, JSON.stringify(data));
            })

            socket.on(SOCKET_EVENTS.DISCONNECT, () => {
                console.log('Socket disconnected', socket.id);
            });

        });

        this.#sub.on('message', async (channel, message) => {
            if (channel === REDIS_CHANNELS.MESSAGES) {
                // toUID | fromUID | message | createdAt
                let parseMessage = JSON.parse(message);
                io.emit(parseMessage.toUID, parseMessage);
                await produceMessage(message);
            }
        });
    }

    get io() {
        return this.#io;
    }
}

module.exports = SocketSerice;