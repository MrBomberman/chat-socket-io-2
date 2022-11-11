const formatMessage = require('./utils/messages');
const { userJoin, checkCurrentUser, getCurrentUser } = require('./utils/users');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const botName = 'Infobip support'

// app.static(__dirname);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('check url', (url) => {
    const indexOfStartId = url.indexOf('#');
    const id = url.slice(indexOfStartId+1)
    const currentUser = checkCurrentUser(id)[0];
    if(currentUser){
      socket.emit('chat message', formatMessage(botName, 'Welcome to chat again!') )
      socket.emit('open input')
    }
  })

  socket.on('join room', (name, url) => {
    const currentUser = userJoin(socket.id , name)
    socket.emit('add hash', currentUser.id)
    socket.emit('chat message', formatMessage(botName, 'Welcome to chat!') )
    socket.join(currentUser.id)
    socket.broadcast
      .to(currentUser.id)
  });
    
  socket.on('chat message', async msg => {
    // console.log(msg)
    await socket.on('getNameOfUser',(url) => {
      const indexOfStartId = url.indexOf('#');
      const id = url.slice(indexOfStartId+1)
      const currentUser = checkCurrentUser(id)[0];
    });

    const user = getCurrentUser(socket.id)

    await io.to(user.id).emit('chat message', formatMessage(socket.id, msg)); // to send message everyone in the chat
  });
});

http.listen(port);
