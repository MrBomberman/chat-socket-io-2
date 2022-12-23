const fetch =  require("node-fetch");

async function startConversation(phone, region){
    
    const response = await fetch('https://infobip.delta-car.ch/conversation', {
    //const response = await fetch('https://infobip.delta-car.ch/conversation', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Accept': "*/*"
            },
            body: `{
                "numberPhone": "${phone}",
                "agentName": "Michael",
                "region": "${region}"
              }`
            });      

    const data = await response.json();
    // console.log('Data!!!!',data)
    return data;
}

module.exports = startConversation;