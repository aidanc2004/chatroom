import { log } from "console";
import { create } from "domain";
import {WebSocket, WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});

let clients = []

// create a client object
function createClient(socket) {
    return {
        socket,
        nick: "Nick",
    };
}

// return the index of a specific client
// because this can change, it can't just be a local variable
function indexOfClient(socket) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i].socket === socket) {
            return i;
        }
    }
}

wss.on('listening', () => {
    console.log("Listening for connections...");
})

wss.on('connection', (ws) => {
    console.log("Got connection");

    clients.push(createClient(ws));

    // messages are sent as json
    ws.send(JSON.stringify("<Server> Welcome! :)"));

    ws.on('message', (msg) => {
        msg = ""+msg; // convert from buffer to string

        // if the client is trying to set their nickname
        if (msg.startsWith("/nick")) {
            // remove "/nick" from msg
            let nick = msg.split(" "); 
            nick.shift();
            nick = nick.join();

            // set nickname of the client
            clients[indexOfClient(ws)].nick = nick;

            return;
        }

        console.log("Recieved message:", msg);

        let nick = clients[indexOfClient(ws)].nick;
        clients.forEach(c => c.socket.send(JSON.stringify(`<${nick}> ${msg}`)))
    })
    
    ws.on("close", () => {
        console.log("Client disconnected");
        clients = clients.filter(s => s !== ws);
    })
});