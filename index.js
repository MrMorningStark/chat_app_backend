const app = require('./app');
const { socket } = require('./socket');

const options = {
    key: process.env.keypem,
    cert: process.env.certpem,
};

const https = require('https').createServer(options, app)

const PORT = process.env.API_PORT || 3000

const io = require('socket.io')(https, {
    cors: {
        origin: '*'
    }
});

global.io = io;

socket();

https.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
    // console.log(process.env);
});
