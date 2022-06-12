const WebSocket = require('ws');
const uuid = require('uuid-random');

const wss = new WebSocket.WebSocketServer({port:8080}, ()=>{
    console.log('server started');
});
function onConnection(client){
    client.id = uuid();
    client.on('message', onMessage);
    client.on('close', onClose);
}
function onMessage(messageJson){
    let message = JSON.parse(messageJson);

}
function onClose(){

}
let clients = [];
let playerDatas = {
    "type":  "playerDatas",
};
wss.on('connection', 
// onConnection); 
    (client) => {
    client.id = uuid();
    let playerData = {
        "id": client.id, 
        "position": {
            x: 0, y: 0, z: 0,
        }
    };
    playerDatas[client.id] = playerData;
    console.log(playerData);
    let playerJoinEventArg = new PlayerJoinEventArg();
    playerJoinEventArg.player = playerData;
    handlePlayerJoin(client, )
    onClientConnect(client);
    client.on('message', (data) => {
        var dataJSON = JSON.parse(data);
        switch(dataJSON.type){
            case "changePosition":
                playerDatas[dataJSON.id]=dataJSON;
                boardcastMessage(getOtherClients(client), dataJSON);
                break;
        }

        console.log("Player Message: ");
        console.log(dataJSON);
    });
    client.on('close', () => {
        delete playerDatas[client.id];
        console.log('This Connection Closed.');
        console.log('Remove Client: ' + client.id);
    });
});

wss.on('listening', () => {
    console.log('listening on port 8080');
});
function boardcastMessage(targets,message){
    targets.forEach(client => {
        client.send(message);
    });
}
function onClientConnect(client){
    playerDatasMessage = {
        type: "playerDatas",
        datas: []
    }


    for(const [key, playerData] of Object.entries(playerDatas)){
        if(key.length == "72845099-b8cd-4596-95b3-34b628a071cb".length){
            playerDatasMessage.datas.push(playerData)
        }
    }
    client.send(JSON.stringify(playerDatasMessage));
}

class OtherPlayerJoinEventArg{
}

class PlayerJoinEventArg{
    type = "OtherPlayerJoinEventArg";
    player = {};
}
class PlayerInitEventArg{
    type = "PlayerInitEventArg";
    playerDatas  = []
}
class Player{
    id ="";
    position={
        x:0, y:0, z:0
    };
}
function handlePlayerJoin(client, playerJoinEventArg){
    playerInitEventArg = new PlayerInitEventArg();
    playerInitEventArg.playerDatas = playerDatas;
    client.send(playerInitEventArg)
    boardcastMessage( getOtherClients(client),playerJoinEventArg)
}
function getOtherClients(exclude){
    return clients.filter(client => client != exclude);
}