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
const logger = require('./utils/logger');
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

const botName = 'Delta support'


app.use(cors(corsOptions)) // Use this after the variable declaration
app.use(express.json())
app.get('/', (req, res) => {
  // console.log('RES', res)
  res.sendFile(__dirname + '/index.html');
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/startChat', (req, res) => {
  res.sendFile(__dirname + '/startChat.html')
})

app.post('/postMessage', async (req, res) => {
  try {
    const users = getAllUsers();
    // console.log('Request:',req.body)
    // console.log(req.body)
    console.log('all users', users);
    // console.log('Body: ', req.body);
    console.log('Users from postmessage', users)
    const body = req.body;
    const numberFrom = body.from;
    const numberTo = body.to;
    const userByPhone = getUserByPhone(numberFrom)[0] || getUserByPhone(numberTo)[0];
    if(body.content.templateName) {
      if(body.content.header == null){
        logger.info(`Message from user ${body.content.templateName}`);
        await io.to(userByPhone.id).emit('chat message', formatMessage(`${userByPhone.agentName}`, body.content.templateName), userByPhone.id);
      } else {
        logger.info(`Message from user ${body.content.templateName}`);
        await io.to(userByPhone.id).emit('chat message', formatMessage(`${userByPhone.agentName}`, body.content), userByPhone.id);
      }
    } else {
      logger.info(`Message from user ${body.content.text}`);
      await io.to(userByPhone.id).emit('chat message', formatMessage(`Client ${userByPhone.clientName}`, body.content.text), userByPhone.id);
    }
    res.send(userByPhone)
    // await io.to(userByPhone.id).emit('chat message', formatMessage(`Client ${body.singleSendMessage.contact.name}`, body.content.text), userByPhone.id);
  } catch(e){
    logger.error(`Error ${e}`)
  }
})

app.post('/openChat', async (req, res) => {
  try {
    console.log(req.body)
    let countEmptyKey = 0;
    for(let [key, value] of Object.entries(req.body)){
      console.log(key, value)
      if(value.length === 0){
        countEmptyKey = countEmptyKey + 1;
      }
    }
    // await io.to('894cd56d-846d-4b8c-925b-1c47d26d60d0').emit('Add garage name', req.body.garageName);
    if(countEmptyKey === 0){
      // let conversationInfo;
      let conversationInfo = await startConversation(req.body.clientPhone, req.body.region)

      logger.info(`Client phone : ${req.body.clientPhone}`)

      let currentUser;
      const userExist = getUserByPhone(req.body.clientPhone)[0];
      console.log(userExist)
      if(Boolean(userExist)){
        currentUser = userExist;
      } else {
        currentUser = userJoin(conversationInfo.uuid , req.body.clientPhone, req.body.garageName, req.body.clientName, req.body.agentName)
      }
      // await io.to(currentUser.id).emit('show garage name', 'lol');
      res.status(200).send(conversationInfo)
      // await io.emit('open chat window', conversationInfo, req.body.clientPhone, req.body.region)
    } else {
      res.status(400).send(`Empty field in request !`)
    }
  } catch(e){
    logger.error(`Error in openchat ${e}`)
    res.status(400).send(`Error! ${e}`)
  }
})

io.on('connection', (client) => {
  client.on('check url', async (url) => {

    try {
      const indexOfStartId = url.indexOf('#');
      const id = url.slice(indexOfStartId+1)
      const currentUser = await getCurrentUser(id)[0];
      const users = getAllUsers();
      // let messages = [];
      // const messages = getMessages(currentUser.username);
      // console.log(messages)

      // logger.info(`All users after reload ${users}`);
      console.log('Current user',currentUser)
      console.log('Users!', users)
      // logger.info(`Users! ${[...users]}`)
      if(currentUser){
        const response = await getMessages(currentUser.phone)
        const messages = await response.json();
        client.emit('show garage name', currentUser.garageName)
        client.emit('show client name', currentUser.clientName)
        client.emit('show agent name', currentUser.agentName)
        client.emit('show message', messages)
        // client.emit('chat message', formatMessage(botName, 'Welcome to chat!'), currentUser.id )
        client.emit('open input')
        client.emit('user exist', currentUser.id)
        client.join(currentUser.id)
        client.broadcast
          .to(currentUser.id)
      } else if ((currentUser === undefined && users.length !== 0 &&
        indexOfStartId !== -1) || (indexOfStartId !== -1 && users.length === 0)){
        client.emit('navigate to home page')
      }
    } catch(e){
      logger.error(`Error ${e}`)
    }
  })

  // client.on('join room', async (phone,region) => {
  //   try {
  //     let conversationInfo = await startConversation(phone, region);
  //     logger.info(`Conversation uuid ${conversationInfo.uuid}`);
  //     let currentUser;
  //     const userExist = getUserByPhone(phone)[0];
  //     if(Boolean(userExist)){
  //       currentUser = userExist;
  //     } else {
  //       currentUser = userJoin(conversationInfo.uuid , phone)
  //     }
  //     // logger.info('join')
  //     await client.emit('add hash', currentUser.id)
  //     logger.info(`Current user join with id : ${currentUser.id}`)
  //     let response;
  //     let messages;
  //     try {
  //       response = await getMessages(phone)
  //       messages = await response.json();
  //     } catch(e){
  //       logger.error(`Error ${e}`)
  //     }
  //     await client.emit('show message', messages)
  //     // await client.emit('chat message', formatMessage(botName, 'Welcome to chat!'),  currentUser.id )
  //     client.emit('open input')
  //   } catch(e){
  //     logger.error(`Error ${e}`)
  //   }
    
  //   // client.join(currentUser.id)
  //   // client.broadcast
  //   //   .to(currentUser.id)
  // });
  

  client.on('chat message', async (msg, id, messageStatus) => {
    try {
      const user = getCurrentUser(id)[0];
      logger.info(`message ${msg}`)
      // console.log((new Date()).toLocaleString('en-GB'), 
      // `message ${msg}`, id);
      await io.to(id).emit('chat message', formatMessage(`${user.agentName}`, msg), id); // to send message everyone in the chat  
      await postMessage(msg, user.phone);
    } catch(e){
      logger.error(`Error ${e}`)
      // console.log((new Date()).toLocaleString('en-GB') , e)
    }
    // if(Boolean(msg.includes('/dossier/guid')) && messageStatus === 'PDF'){
    //   await postDocumentPDF(msg, user.phone)
    // } else {
    //   await postMessage(msg, user.phone);
    // }
  });
});

http.listen(port);
