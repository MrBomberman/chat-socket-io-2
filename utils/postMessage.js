const fetch =  require("node-fetch");
const logger = require('./logger')

async function postMessage(message, phone){
    console.log('Message', message, 'Phone', phone)

    const response = await fetch('https://infobip.delta-car.ch/message/send', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Accept': "*/*"
            },
            body: `{
                "ClientNumber": "${phone}",
                "Channel" : "WHATSAPP",
                "ContentType" : "TEXT",
                "ContentMessage" : {
                "text" : "${message}"
                }    
                }`
            });      

    logger.info(`Response status of post message: ${response.status}`)
            // console.log(response)
}

module.exports = postMessage;