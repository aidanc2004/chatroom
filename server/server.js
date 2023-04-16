import {WebSocket, WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});

// example logins
let users = [{
    username: "user",
    password: "123",
    color: "CornflowerBlue",
    userID: 0
}, {
    username: "Aidan",
    password: "pass",
    color: "LightSalmon",
    userID: 1
}]

const MESSAGE_LEN = 100; // max message length

let clients = []
let userNum = 0; // number to use for new users nickname

// create a default client object
function createClient(socket) {
    return {
        socket,
        nick: `Guest${++userNum}`,
        color: "CornflowerBlue"
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

// create a json string of a message
function message(nick, msg, color) {
    return JSON.stringify({type: "message", nick, msg, color});
}

// create a json string on if a login succeeded
function loginSuccess(result) {
    return JSON.stringify({type: "login", success: result});
}

// handle a message from the client
function handleMessage(ws, msg) {
    msg = ""+msg.content; // convert from buffer to string

    // handled client side but this is backup
    if (msg.length > MESSAGE_LEN) {
        msg = msg.split("").splice(0, MESSAGE_LEN).join("");
    }

    // if the client is trying to set their nickname
    // if (msg.startsWith("/nick")) {
    //     setNickname(ws, msg);
    //     return;
    // }

    let nick = clients[indexOfClient(ws)].nick;
    let color = clients[indexOfClient(ws)].color;
    clients.forEach(c => c.socket.send(message(nick, msg, color)));
}

// handle a login request from a client
function handleLogin(ws, msg) {
    for (let i = 0; i < users.length; i++) {
        let login = users[i];
        if (msg.username === login.username && msg.password === login.password) {
            console.log("Logging in", login.username);
            clients[indexOfClient(ws)].nick = login.username;
            clients[indexOfClient(ws)].color = login.color;
            ws.send(loginSuccess(true));
            return;
        }
    }

    ws.send(loginSuccess(false));
}

// allow a client to set their nickname
// function setNickname(ws, msg) {
//     // remove "/nick" from msg
//     let nick = msg.split(" "); 
//     nick.shift();
//     nick = nick.join();

//     // if nickname is invalid
//     if (nick === "Server") {
//         return;
//     }

//     // set nickname to correct length
//     if (nick.length > NICK_LEN) {
//         nick = nick.split("").splice(0, NICK_LEN).join("");
//     }

//     // set nickname of the client
//     clients[indexOfClient(ws)].nick = nick;
// }

wss.on('listening', () => {
    console.log("Listening for connections...");
})

wss.on('connection', (ws) => {
    console.log("Got connection");

    clients.push(createClient(ws));

    // messages are sent as json
    ws.send(message("Server", "Welcome! Be kind. :)", "FireBrick"));

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