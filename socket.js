const { Server } = require("socket.io");
const { SOCKET_EVENTS, REDIS_CHANNELS } = require("./constant");
const { Redis } = require("ioredis");

const pub = new Redis(
    {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
    }
);
const sub = new Redis(
    {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
    }
);

class SocketSerice {
    #io;
    constructor() {
        console.log("Init socket service...");
        this.#io = new Server();
        sub.subscribe(REDIS_CHANNELS.MESSAGES);
    }

    initListeners() {
        const io = this.#io;
        console.log('Init socket listeners...');
        io.on(SOCKET_EVENTS.CONNECT, socket => {
            console.log('New socket connected', socket.id);

            socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
                console.log('new message received', data.message);
                await pub.publish(REDIS_CHANNELS.MESSAGES, JSON.stringify(data));
            })

            socket.on(SOCKET_EVENTS.DISCONNECT, () => {
                console.log('Socket disconnected', socket.id);
            });

        });

        sub.on('message', async (channel, message) => {
            if (channel === REDIS_CHANNELS.MESSAGES) {
                console.log('sending message', message);
                const data = JSON.parse(message);
                io.emit(SOCKET_EVENTS.RECEIVE_MESSAGE, data);
            }
        });
    }

    get io() {
        return this.#io;
    }
}

module.exports = SocketSerice;