const fetch =  require("node-fetch");

async function getMessages(phone){
    
    return fetch(`https://infobip.delta-car.ch/messages?phoneNumber=${phone}`, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Accept': "*/*"
            }
            });      

    // const data = await response.json();
    // return data;
}

module.exports = getMessages;