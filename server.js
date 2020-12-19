var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3000;

// Add headers
app.use(function (req, res, next) {
    // Website(s) you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

//Check Node Server is working fine
app.get('/', (req, res) => res.send('Hello Digicorp,Socket Server is working....!'));

//IO connection and Socket broadcast
io.on('connection', (socket) => { 
    console.log('A new connection is established'); 

    socket.on('message', (msg) => {
        socket.broadcast.emit('message-broadcast', msg);
    });
});

//HTTP port listen binding
http.listen(port, () => {
  console.log(`listening on *: ${port}`);
});