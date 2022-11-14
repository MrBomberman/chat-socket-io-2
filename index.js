const formatMessage = require('./utils/messages');
const { userJoin, checkCurrentUser, getCurrentUser } = require('./utils/users');
const postMessage = require('./utils/postMessage');

const express = require('express');
const app = express();
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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/about', () => {
  console.log('about')
})

io.on('connection', (socket) => {
  socket.on('check url', (url) => {
    const indexOfStartId = url.indexOf('#');
    const id = url.slice(indexOfStartId+1)
    const currentUser = checkCurrentUser(id)[0];
    console.log(currentUser)
    if(currentUser){
      socket.emit('chat message', formatMessage(botName, 'Welcome to chat again!'), currentUser.id )
      socket.emit('open input')
      socket.emit('user exist', currentUser.id)
      socket.join(currentUser.id)
      socket.broadcast
        .to(currentUser.id)
    } 
  })

  socket.on('join room', (name, url) => {
    const currentUser = userJoin(socket.id , name)
    console.log('join')
    socket.emit('add hash', currentUser.id)
    socket.emit('chat message', formatMessage(botName, 'Welcome to chat!'),  currentUser.id )
    // socket.join(currentUser.id)
    // socket.broadcast
    //   .to(currentUser.id)
  });
  

  socket.on('chat message', async (msg, id) => {
    // socket.on('getNameOfUser', async (url) => {
    //   const indexOfStartId = url.indexOf('#');
    //   const id = url.slice(indexOfStartId+1)
    //   const currentUser = checkCurrentUser(id)[0];
    //   // await io.to(currentUser.id).emit('chat message', formatMessage(currentUser.id, msg)); // to send message everyone in the chat
    // });
    // const users = getCurrentUser();
    console.log(msg, id)
    await io.to(id).emit('chat message', formatMessage(id, msg), id); // to send message everyone in the chat
    await postMessage(msg);
  });
});

http.listen(port, '192.168.0.10');
