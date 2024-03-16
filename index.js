const app = require('./app');

const http = require('http').createServer(app)

const PORT = process.env.API_PORT || 3000

http.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
    // console.log(process.env);
});
