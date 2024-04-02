const app = require('./app');
const http = require('http');
const SocketSerice = require('./services/socket');

const PORT = process.env.API_PORT || 3000
async function init() {
    const socketService = new SocketSerice();

    const httpServer = http.createServer(app);

    socketService.io.attach(httpServer);
    console.log('socket listening...');

    httpServer.listen(PORT, () => {
        console.log(`server is running on ${PORT}`);
    });

}

init();
