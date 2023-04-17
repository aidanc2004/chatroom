import {WebSocket, WebSocketServer} from "ws";

const wss = new WebSocketServer({port: 8080});

// example logins
let users = [{
    username: "user",
    password: "123",
    color: "CornflowerBlue",
}, {
    username: "Aidan",
    password: "pass",
    color: "LightSalmon",
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
function loginSuccess(result, username="") {
    return JSON.stringify({type: "login", success: result, username});
}

// create a json string on if a sign up succeeded
function signUpSuccess(result) {
    return JSON.stringify({type: "signup", success: result});
}

// handle a message from the client
function handleMessage(ws, msg) {
    msg = ""+msg.content; // convert from buffer to string

    // handled client side but this is backup
    if (msg.length > MESSAGE_LEN) {
        msg = msg.split("").splice(0, MESSAGE_LEN).join("");
    }

    let nick = clients[indexOfClient(ws)].nick;
    let color = clients[indexOfClient(ws)].color;

    broadcast(nick, msg, color);
}

// handle a login request from a client
function handleLogin(ws, msg) {
    for (let i = 0; i < users.length; i++) {
        let login = users[i];
        if (msg.username === login.username && msg.password === login.password) {
            console.log("Logging in", login.username);
            clients[indexOfClient(ws)].nick = login.username;
            clients[indexOfClient(ws)].color = login.color;
            broadcastOthers(ws, "Server", login.username + " Joined.", "FireBrick");
            ws.send(loginSuccess(true, login.username));
            return;
        }
    }

    ws.send(loginSuccess(false));
}

// handle a sign up request from a client
function handleSignUp(ws, msg) {
    // make sure username is not in use
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        if (msg.username === user.username) {
            ws.send(signUpSuccess(false));
            return;
        }
    }

    let newUser = {
        username: msg.username,
        password: msg.password,
        color: "Red",
    }

    users.push(newUser);

    console.log("Created user", msg.username);

    ws.send(signUpSuccess(true));
}

// send message to all clients
function broadcast(nick, msg, color) {
    clients.forEach(c => c.socket.send(message(nick, msg, color)));
}

// send message to all clients except ws
function broadcastOthers(ws, nick, msg, color) {
    clients.forEach(c => {
        if (c.socket === ws) return;
        c.socket.send(message(nick, msg, color))
    });
}

wss.on('listening', () => {
    console.log("Listening for connections...");
})

wss.on('connection', (ws) => {
    console.log("Got connection");

    clients.push(createClient(ws));

    ws.send(message("Server", "Welcome! Be kind. :)", "FireBrick"));

    ws.on('message', (msg) => {
        msg = JSON.parse(msg);

        switch (msg.type) {
            case "message":
                handleMessage(ws, msg);
                break;
            case "login":
                handleLogin(ws, msg);
                break;
            case "signup":
                handleSignUp(ws, msg);
                break;
            default:
                break;
        }
    });
    
    ws.on("close", () => {
        console.log("Client disconnected");
        clients = clients.filter(s => s !== ws);
    });
});