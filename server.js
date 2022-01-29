const WebSocket = require('ws');
var uuid = require('uuid-random');

const wss = new WebSocket.WebSocketServer({port:8080}, ()=>{
    console.log('server started');
});



var playerDatas = {
    "type":  "playerDatas",
}

wss.on('connection', (client) => {
    client.id = uuid();
    var playerData = {id: client.id};
    playerDatas["" + client.id] = playerData;
    client.send(playerData);
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