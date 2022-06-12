"use strict";
exports.__esModule = true;
var ws_1 = require("ws");
var uuid = require('uuid-random');
// declaration
var message = Symbol('message');
var clients = [];
function getClientBySocket(webSocket) {
    return clients.find(function (client) { return client.webSocket == webSocket; });
}
function addClient(webSocket) {
    var rt = new Client(webSocket);
    clients.push(rt);
    return rt;
}
function removeClient(webSocket) {
    var client = getClientBySocket(webSocket);
    if (client == undefined) {
        throw new ReferenceError("Cannot find reference of target webSocket");
    }
    var index = clients.indexOf(client);
    clients.splice(index);
}
// dirty code
var options = {
    port: 8888
};
var wss = new ws_1.WebSocketServer(options, onServerStart);
wss.on('listening', onListening);
wss.on('connection', onConnection);
wss.on('close', onClose);
//functions
function onServerStart() {
    console.log("Server Started");
}
;
function onListening() {
    console.log("listening on port ".concat(this.options.port));
}
function onConnection(clientSocket, request) {
    var _a;
    console.log('onConnection');
    clientSocket.on('close', onClientClose);
    clientSocket.on('message', onMessage);
    addClient(clientSocket);
    clientSocket.send(JSON.stringify({
        type: "InitPlayer",
        data: {
            id: (_a = getClientBySocket(clientSocket)) === null || _a === void 0 ? void 0 : _a.id,
            others: clients
                .filter(function (client) { return client.webSocket != clientSocket; })
                .map(function (client) {
                return {
                    data: {
                        id: client.id
                    }
                };
            })
        }
    }));
    clientSocket.send(JSON.stringify({
        type: "newFunction",
        data: {
            animals: [{ name: "Doggy" }, { name: "Kitty" }]
        }
    }));
}
function onMessage(data, isBinary) {
    var receivedMessage = JSON.parse(data.toString());
    // console.log('data.toString: ' + data.toString());
    // console.log('receivedMessage.type: ' + receivedMessage.type);
    switch ('' + receivedMessage.type) {
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
function onClose() {
    console.log('onClose');
    console.log(wss.clients.size);
}
function boardcastExceptOne(except, data, cb) {
    // console.log('boardcastExceptOne');
    // console.log('wss.clients: '+ wss.clients);
    clients
        .filter(function (client) { var _a; return client.id != ((_a = getClientBySocket(except)) === null || _a === void 0 ? void 0 : _a.id); })
        .forEach(function (client) {
        // console.log('doSomething');
        client.webSocket.send(data, cb);
    });
}
var Vector3 = /** @class */ (function () {
    function Vector3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Vector3.zero = new Vector3(0, 0, 0);
    return Vector3;
}());
var PlayerData = /** @class */ (function () {
    function PlayerData() {
        this.position = Vector3.zero;
    }
    return PlayerData;
}());
var Client = /** @class */ (function () {
    function Client(webSocket, player) {
        this.webSocket = webSocket;
        this.id = uuid();
        this.player = player;
    }
    return Client;
}());
function onClientClose(code, reason) {
    var _a;
    var args = {
        type: "PlayerExit",
        data: {
            id: (_a = getClientBySocket(this)) === null || _a === void 0 ? void 0 : _a.id
        }
    };
    var json = JSON.stringify(args);
    console.log(json);
    removeClient(this);
    boardcastExceptOne(this, json);
}
