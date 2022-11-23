const fetch =  require("node-fetch");

async function postDocumentPDF(message, phone){
    
    const response = await fetch('http://46.138.245.127:7557/message/send', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Accept': "*/*"
            },
            body: `{
                "AgentName" : "Smith",
                "ClientNumber": "${phone}",
                "Channel" : "WHATSAPP",
                "ContentType" : "DOCUMENT",
                "ContentMessage" : {
                "url" : "${message}"
                }    
                }`
            });      

    console.log(response.status)
}

module.exports = postDocumentPDF;