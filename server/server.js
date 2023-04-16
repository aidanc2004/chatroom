import {WebSocket, WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});

const MESSAGE_LEN = 100; // max message length
const NICK_LEN = 10; // max nickname length

let clients = []
let userNum = 0; // number to use for new users nickname

// create a default client object
function createClient(socket) {
    return {
        socket,
        nick: `User${++userNum}`,
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

// allow a client to set their nickname
function setNickname(ws, msg) {
    // remove "/nick" from msg
    let nick = msg.split(" "); 
    nick.shift();
    nick = nick.join();

    // set nickname to correct length
    if (nick.length > NICK_LEN) {
        nick = nick.split("").splice(0, NICK_LEN).join("");
    }

    // set nickname of the client
    clients[indexOfClient(ws)].nick = nick;
}

wss.on('listening', () => {
    console.log("Listening for connections...");
})

wss.on('connection', (ws) => {
    console.log("Got connection");

    clients.push(createClient(ws));

    // messages are sent as json
    ws.send(JSON.stringify({nick: "Server", msg: "Welcome! Be kind. :)"}));

    ws.on('message', (msg) => {
        msg = ""+msg; // convert from buffer to string

        // handled client side but this is backup
        if (msg.length > MESSAGE_LEN) {
            msg = msg.split("").splice(0, MESSAGE_LEN).join("");
        }

        // if the client is trying to set their nickname
        if (msg.startsWith("/nick")) {
            setNickname(ws, msg);
            return;
        }

        let nick = clients[indexOfClient(ws)].nick;
        // TODO: send as an object and parse on client side
        clients.forEach(c => c.socket.send(JSON.stringify({nick, msg})))
    })
    
    ws.on("close", () => {
        console.log("Client disconnected");
        clients = clients.filter(s => s !== ws);
    })
});