const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, getAllUsers, getUserByPhone } = require('./utils/users');
const postMessage = require('./utils/postMessage');

const express = require('express');
const app = express();
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const cors = require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const botName = 'Infobip support'

// app.static(__dirname);
app.use(cors(corsOptions)) // Use this after the variable declaration
app.use(express.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/postMessage', async (req, res) => {
  const users = getAllUsers();
  console.log(req.body)
  const body = req.body;
  const numberFrom = body.from;
  const userByPhone = getUserByPhone(numberFrom)[0]
  res.send(userByPhone)
  await io.to(userByPhone.id).emit('chat message', formatMessage(`Delta agent ${body.singleSendMessage.contact.name}`, body.content.text), userByPhone.id);
})

io.on('connection', (client) => {
  client.on('check url', (url) => {
    const indexOfStartId = url.indexOf('#');
    const id = url.slice(indexOfStartId+1)
    const currentUser = getCurrentUser(id)[0];
    console.log(currentUser)
    if(currentUser){
      client.emit('chat message', formatMessage(botName, 'Welcome to chat again!'), currentUser.id )
      client.emit('open input')
      client.emit('user exist', currentUser.id)
      client.join(currentUser.id)
      client.broadcast
        .to(currentUser.id)
    } 
  })

  client.on('join room', (name, url) => {
    const currentUser = userJoin(client.id , name)
    console.log('join')
    client.emit('add hash', currentUser.id)
    client.emit('chat message', formatMessage(botName, 'Welcome to chat!'),  currentUser.id )
    // client.join(currentUser.id)
    // client.broadcast
    //   .to(currentUser.id)
  });
  

  client.on('chat message', async (msg, id) => {
    // client.on('getNameOfUser', async (url) => {
    //   const indexOfStartId = url.indexOf('#');
    //   const id = url.slice(indexOfStartId+1)
    //   const currentUser = checkCurrentUser(id)[0];
    //   // await io.to(currentUser.id).emit('chat message', formatMessage(currentUser.id, msg)); // to send message everyone in the chat
    // });
    // const users = getCurrentUser();
    console.log(msg, id)
    await io.to(id).emit('chat message', formatMessage(id, msg), id); // to send message everyone in the chat
    // await postMessage(msg);
  });
});

http.listen(port);
