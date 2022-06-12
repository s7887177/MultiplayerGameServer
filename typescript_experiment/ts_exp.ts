import { WebSocket, WebSocketServer,ServerOptions, RawData } from 'ws';
let uuid = require('uuid-random');
import { IncomingMessage } from 'http';
// declaration
let message = Symbol('message');
let clients : Client[] = [];
function getClientBySocket(webSocket : WebSocket) : Client | undefined{
    return clients.find(client => client.webSocket == webSocket);
}
function addClient(webSocket: WebSocket) : Client{
    let rt = new Client(webSocket);
    clients.push(rt);
    return rt;
}
function removeClient(webSocket: WebSocket): void{
    let client = getClientBySocket(webSocket);
    if(client == undefined){
        throw new ReferenceError("Cannot find reference of target webSocket");
    }
    let index = clients.indexOf(client as Client);
    clients.splice(index);
}

// dirty code
let options : ServerOptions = {
    port: 8888
}
let wss = new WebSocketServer(options,onServerStart);
wss.on('listening', onListening);
wss.on('connection', onConnection);
wss.on('close', onClose);
//functions
function onServerStart(){
    console.log("Server Started");
};
function onListening(this: WebSocketServer){
    console.log(`listening on port ${this.options.port}`);
}
function onConnection(this: WebSocketServer, clientSocket: WebSocket, request: IncomingMessage){
    console.log('onConnection');
    clientSocket.on('close', onClientClose)
    clientSocket.on('message', onMessage)
    addClient(clientSocket);

    clientSocket.send(JSON.stringify({
        type: "InitPlayer",
        data: {
            id: getClientBySocket(clientSocket)?.id,
            others: clients
            .filter(client => client.webSocket != clientSocket)
            .map(client => {
                return {
                    data: {
                        id: client.id,
                    }
                }
            })
        }
    }));
    
    
    clientSocket.send(JSON.stringify({
        type: "newFunction",
        data: {
            animals:[{name: "Doggy"}, {name: "Kitty"}]
        }
    }));
}

function onMessage(this: WebSocket, data: RawData, isBinary: boolean){
    let receivedMessage = JSON.parse(data.toString());
    // console.log('data.toString: ' + data.toString());
    // console.log('receivedMessage.type: ' + receivedMessage.type);
    switch (''+receivedMessage.type) {
        case 'SpawnPlayer':
            // console.log('SpawnPlayer');
            boardcastExceptOne(this, data.toString());
            break;
        case 'ShutdownServer':
            break;
        case 'MovePlayer':
            boardcastExceptOne(this, data.toString());
            break;
        case 'SpawnBullet':
            boardcastExceptOne(this, data.toString());
            break;
        case 'OnPlayerExit':

            break;
        default:
            break;
    }
}
function onClose(this: WebSocketServer){
    console.log('onClose');
    console.log(wss.clients.size);
}

function boardcastExceptOne(except: WebSocket, data: any,cb?:((err? : Error | undefined) => void | undefined)): void{
    // console.log('boardcastExceptOne');
    // console.log('wss.clients: '+ wss.clients);
    clients
    .filter(client => client.id != getClientBySocket(except)?.id)
    .forEach(client => {
        // console.log('doSomething');
        client.webSocket.send(data, cb);
    });
}

class Vector3{
    static zero: Vector3 = new Vector3(0,0,0);
    x: number;
    y: number;
    z: number;
    constructor(x:number, y:number, z:number){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class PlayerData{
    position: Vector3 = Vector3.zero;
}

class Client{
    id: string;
    webSocket: WebSocket;
    player?: PlayerData;
    constructor(webSocket: WebSocket, player?: PlayerData){
        this.webSocket = webSocket;
        this.id = uuid();
        this.player = player;
    }
}

function onClientClose(this: WebSocket, code: number, reason: Buffer) {
    let args = {
        type:"PlayerExit",
        data:{
            id: getClientBySocket(this)?.id
        }
    }
    let json = JSON.stringify(args);
    console.log(json);
    removeClient(this);
    boardcastExceptOne(this, json);

}
