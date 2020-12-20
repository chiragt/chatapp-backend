var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
dotenv.config();
const JWT_SECRET_KEY = 'CHATAPP';
const jwt  = require('jsonwebtoken');
const db = require('./models'); 
const port = process.env.PORT || 3000;
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

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
        //io.to(socket.id).emit('message-broadcast', msg);
    });
});

//HTTP port listen binding
http.listen(port, () => {
  console.log(`listening on *: ${port}`);
});

//User Registration 
app.post('/api/register',async (req, res) => {
    var { firstname, lastname, username, password } = req.body;

    //Check is username already exists
    db.User.findOne({where: {username}})
    .then((userdetail) => {
        if(userdetail == null){
            var salt = bcrypt.genSaltSync(10);
            password = bcrypt.hashSync(req.body.password, salt);
            return db.User.create({ firstname, lastname, username, password })
            .then((userdetail) => res.send(userdetail))
            .catch((err) => {
                console.log('***There was an error creating a contact', JSON.stringify(contact));
                return res.status(400).send(err);
            })
        } else {
            res.status(400).send({status : "error", message : "Username already exists"});
        }
    })
    .catch((err) => {
      return res.send(err)
    });
 });

//User Login
app.post('/api/login', (req, res) => {
    const {username,password} = req.body;
    db.User.findOne({where: {username}})
    .then((userdetail) => {
        //console.log(userdetail,"userdetail");
        if(userdetail !== null){
            var userdetail = userdetail.get({ plain: true });
            bcrypt.compare(password, userdetail.password, async function (err, ress) {//First argurment is the input string to be compared
                if (ress) {
                    const token = jwt.sign({ name: userdetail.username }, JWT_SECRET_KEY);
                    userdetail.token = token;
                    return res.json({status: "success", message: 'Login successful',data : userdetail});
                } else {
                    return res.status(400).json({status: "error", message: 'Wrong password'});
                }
            });
        } else {
            res.status(400).send({"status" : "error", message : "User not found"});
        }
    })
    .catch((err) => {
      return res.status(400).send(err)
    });
  });

//Get users
app.get('/api/users', (req, res) => {
    return db.User.findAll()
    .then((users) => res.send(users))
    .catch((err) => {
      return res.status(400).send(err)
    });
});

db.Messages.hasOne(db.MessageReference);
db.MessageReference.belongsTo(db.Messages, {
  foreignKey: "message_id"
});

//Save messages
app.post('/api/message', (req, res) => {
    const { message} = req.body;
    return db.Messages.create({ message })
        .then((messagedetail) => {
                var messageid = messagedetail.get({ plain: true })
                var message_id = messageid.id;
                const { from_id,to_id } = req.body;
                return db.MessageReference.create({ message_id,from_id,to_id })
                .then((messagesend) => {res.send(messagesend)})
                .catch((err) => {
                    //console.log(err,"here")
                    return res.status(400).send(err)})
            }
        )
        .catch((err) => {
            return res.status(400).send(err);
        })
});

//Get Messages
app.get('/api/message/:from_id/:to_id', (req, res) => {
    const { from_id,to_id} = req.params;
    return db.MessageReference.findAll({
        where: {
                from_id: {
                    [Op.or]: [from_id,to_id]
                },
                to_id: {
                    [Op.or]: [from_id,to_id]
                }
             },
             order: [['createdAt', 'ASC']],
            include: [ "Message"]
       })
       .then((users) => {
           //console.log(users,"all");
           res.send(users)
       })
       .catch((err) => {
           //console.log(err,"here")
         return res.status(400).send(err)
       });
});