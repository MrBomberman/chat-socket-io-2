const fetch =  require("node-fetch");

async function getMessages(phone){
    
    return fetch(`http://46.138.245.127:7557/messages?phoneNumber=${phone}&agentName=Smith`, {
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