import {WebSocket, WebSocketServer} from "ws";
import fs from "fs";

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
}];

const MESSAGE_LEN = 100; // max message length

let clients = [] // all currently logged in users

// create a default client object
function createClient(socket) {
    return {
        socket,
        nick: `Guest`,
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
// TODO: dont send pfp with message, store it client side on login
function message(nick, msg, color, pfp) {
    let image;

    if (fs.existsSync(`./server/pfps/${nick}`)) {
        image = fs.readFileSync(`./server/pfps/${nick}`, {encoding: "base64"});
    } else {
        image = fs.readFileSync("./server/pfps/NoPfp", {encoding: "base64"});
    }

    return JSON.stringify({type: "message", nick, msg, color, image});
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
            broadcastOthers(ws, "Server", `${login.username} joined.`, "FireBrick");
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

// handle a request to change the users color
function handleSettings(ws, msg) {
    // update pfp
    const pfpBase64 = msg.pfp.replace(/^data:image\/(png|jpe?g|gif|webp);base64,/, '');
    const pfpBuffer = Buffer.from(pfpBase64, 'base64');
    fs.writeFileSync(`./server/pfps/${msg.username}`, pfpBuffer);

    // update color for currently logged in users
    clients[indexOfClient(ws)].color = msg.color;

    // update color in list of users
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === msg.username) {
            users[i].color = msg.color;
        }
    }
}

// send message to all clients
function broadcast(nick, msg, color, pfp) {
    clients.forEach(c => c.socket.send(message(nick, msg, color, pfp)));
}

// send message to all clients except ws
function broadcastOthers(ws, nick, msg, color, pfp) {
    clients.forEach(c => {
        if (c.socket === ws) return;
        c.socket.send(message(nick, msg, color, pfp))
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
            case "settings":
                handleSettings(ws, msg);
                break;
            default:
                break;
        }
    });
    
    ws.on("close", () => {
        console.log("Client disconnected");

        let nick = clients[indexOfClient(ws)].nick;
        if (nick !== "Guest") {
            broadcast("Server", `${nick} left.`, "FireBrick");
        }

        clients = clients.filter(s => s !== ws);
    });
});