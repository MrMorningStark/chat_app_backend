const app = require('./app');
const { socket } = require('./socket');

const http = require('http').createServer(app)

const PORT = process.env.API_PORT || 3000

const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

global.io = io;

socket();

http.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
    // console.log(process.env);
});
