import {WebSocket, WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});

console.log("started");

wss.on('connection', (ws) => {
    console.log("got connection");

    ws.send("TEST");
    ws.close();

    console.log("send data \"TEST\", done");
})