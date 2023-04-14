import { log } from "console";
import {WebSocket, WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});

let clients = []

wss.on('listening', () => {
    console.log("Listening for connections...");
})

wss.on('connection', (ws) => {
    console.log("Got connection");
    clients.push(ws);

    // messages are sent as json
    ws.send(JSON.stringify("Hello! :)"));

    ws.on('message', (msg) => {
        msg = ""+msg; // convert from buffer to string
        console.log("Recieved message:", msg);
        clients.forEach(s => s.send(JSON.stringify(msg)))
    })
    
    ws.on("close", () => {
        console.log("Client disconnected");
        clients = clients.filter(s => s !== ws);
    })
});