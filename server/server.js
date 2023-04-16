import {WebSocket, WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});

const MESSAGE_LEN = 100; // max message length
const NICK_LEN = 10; // max nickname length

const exampleLogin = {
    username: "user",
    password: "123",
}

let clients = []
let userNum = 0; // number to use for new users nickname

// create a default client object
function createClient(socket) {
    return {
        socket,
        nick: `Guest${++userNum}`,
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

// handle a message from the client
function handleMessage(ws, msg) {
    msg = ""+msg.content; // convert from buffer to string

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
    clients.forEach(c => c.socket.send(JSON.stringify({type: "message", nick, msg})))
}

function handleLogin(ws, login) {
    console.log("Logging in", login.username);

    if (login.username === exampleLogin.username && login.password === exampleLogin.password) {
        clients[indexOfClient(ws)].nick = exampleLogin.username;
        ws.send(JSON.stringify({type: "login", success: true}));
    } else {
        ws.send(JSON.stringify({type: "login", success: false}));
    }
}

// allow a client to set their nickname
function setNickname(ws, msg) {
    // remove "/nick" from msg
    let nick = msg.split(" "); 
    nick.shift();
    nick = nick.join();

    // if nickname is invalid
    if (nick === "Server") {
        return;
    }

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
    ws.send(JSON.stringify({nick: "Server", msg: "Welcome! Be kind. :)", type: "message"}));

    ws.on('message', (msg) => {
        msg = JSON.parse(msg);

        if (msg.type === "message") {
            handleMessage(ws, msg);
        }

        if (msg.type === "login") {
            handleLogin(ws, msg);
        }
    });
    
    ws.on("close", () => {
        console.log("Client disconnected");
        clients = clients.filter(s => s !== ws);
    });
});