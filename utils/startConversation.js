const fetch =  require("node-fetch");

async function startConversation(phone){
    
    const response = await fetch('http://46.138.245.127:7557/conversation', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Accept': "*/*"
            },
            body: `{
                "numberPhone": "${phone}",
                "agentName": "Smith"
              }`
            });      

    const data = await response.json();
    return data;
}

module.exports = startConversation;