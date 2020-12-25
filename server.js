const http = require('http');
const app = require('./app');
const port = process.env.port || 3000;
// const port = process.env.port || 21206;
const server = http.createServer(app);
server.listen(port);
