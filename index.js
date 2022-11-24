const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, getAllUsers, getUserByPhone } = require('./utils/users');
const postMessage = require('./utils/postMessage');


const express = require('express');
const { writeFile } = require("fs");
const app = express();
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 6002;
const cors = require("cors");
const getMessages = require('./utils/getMessages');
const startConversation = require('./utils/startConversation');
const postDocumentPDF = require('./utils/postDocumentPDF');
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const botName = 'Delta support'

// app.static(__dirname);
app.use(cors(corsOptions)) // Use this after the variable declaration
app.use(express.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/startChat', (req, res) => {
  res.sendFile(__dirname + '/startChat.html')
})

app.post('/postMessage', async (req, res) => {
  const users = getAllUsers();
  console.log(req.body)
  console.log('all users', users);
  const body = req.body;
  const numberFrom = body.from;
  const userByPhone = getUserByPhone(numberFrom)[0];
  res.send(userByPhone)
  await io.to(userByPhone.id).emit('chat message', formatMessage(`Client ${body.singleSendMessage.contact.name}`, body.content.text), userByPhone.id);
})

app.post('/openChat', async (req, res) => {
  console.log(req.body)
  let countEmptyKey = 0;
  for(let [key, value] of Object.entries(req.body)){
    console.log(key, value)
    if(value.length === 0){
      countEmptyKey = countEmptyKey + 1;
    }
  }

  if(countEmptyKey === 0){
    const conversationInfo = await startConversation(req.body.clientPhone)
    // await io.emit('open new chat', req.body)
    console.log(conversationInfo)
    res.status(200).send(req.body)
    await io.emit('open chat window', conversationInfo, req.body.clientPhone)
  } else {
    res.status(400).send(`Empty field in request !`)
  }
})

io.on('connection', (client) => {
  client.on('check url', async (url) => {
    const indexOfStartId = url.indexOf('#');
    const id = url.slice(indexOfStartId+1)
    const currentUser = getCurrentUser(id)[0];
    const users = getAllUsers();
    // let messages = [];
    // const messages = getMessages(currentUser.username);
    // console.log(messages)
    console.log('all users after reload' , users)
    console.log(currentUser)
    if(currentUser){
      const response = await getMessages(currentUser.phone)
      const messages = await response.json();
      client.emit('show message', messages)
      client.emit('chat message', formatMessage(botName, 'Welcome to chat!'), currentUser.id )
      client.emit('open input')
      client.emit('user exist', currentUser.id)
      client.join(currentUser.id)
      client.broadcast
        .to(currentUser.id)
    } else if ((currentUser === undefined && users.length !== 0 &&
      indexOfStartId !== -1) || (indexOfStartId !== -1 && users.length === 0)){
      client.emit('navigate to home page')
    }
  })

  client.on('upload', (file, callback) => {
    console.log(file); // <Buffer 25 50 44 ...>

    // save the content to the disk, for example
    writeFile("/tmp/upload", file, (err) => {
      callback({ message: err ? "failure" : "success" });
    })
  })

  client.on('join room', async (phone) => {
    const conversationInfo = await startConversation(phone);
    console.log('Response', conversationInfo)
    let currentUser;
    const userExist = getUserByPhone(phone)[0];
    if(Boolean(userExist)){
      currentUser = userExist;
    } else {
      currentUser = userJoin(conversationInfo.uuid , phone)
    }
    console.log('join')
    await client.emit('add hash', currentUser.id)
    console.log(currentUser.id)
    const response = await getMessages(phone)
    const messages = await response.json();
    await client.emit('show message', messages)
    await client.emit('chat message', formatMessage(botName, 'Welcome to chat!'),  currentUser.id )
    client.emit('open input')
    
    // client.join(currentUser.id)
    // client.broadcast
    //   .to(currentUser.id)
  });
  

  client.on('chat message', async (msg, id, messageStatus) => {
    const user = getCurrentUser(id)[0];
    console.log(msg, id);
    await io.to(id).emit('chat message', formatMessage('You', msg), id); // to send message everyone in the chat
    if(Boolean(msg.includes('/dossier/guid')) && messageStatus === 'PDF'){
      await postDocumentPDF(msg, user.phone)
    } else {
      await postMessage(msg, user.phone);
    }
  });
});

http.listen(port);
