const app = require('./app');
const http = require('http');
const SocketSerice = require('./socket');

const PORT = process.env.API_PORT || 3000
async function init() {
    const socketService = new SocketSerice();

    const httpServer = http.createServer(app);

    socketService.io.attach(httpServer);


    httpServer.listen(PORT, () => {
        console.log(`server is running on ${PORT}`);
    });

    socketService.initListeners();

}

init();
