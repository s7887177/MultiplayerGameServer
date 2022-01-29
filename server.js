const WebSocket = require('ws');
var uuid = require('uuid-random');

const wss = new WebSocket.WebSocketServer({port:8080}, ()=>{
    console.log('server started');
});



var playerData = {
    "type":  "playerData",
}

wss.on('connection', (client) => {
    client.id = uuid();
    playerData["" + client.id] = {id: client.id};
    client.send(`{"id" : "${client.id}`);
    client.on('message', (data) => {
        var dataJSON = JSON.parse(data);
        
        console.log("Player Message: ");
        console.log(dataJSON);
    });
    client.on('close', () => {
        console.log('This Connection Closed.');
        console.log('Remove Client: ' + client.id);
    });
});

wss.on('listening', () => {
    console.log('listening on port 8080');
});