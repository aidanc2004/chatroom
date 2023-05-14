import {WebSocket, WebSocketServer} from "ws";
import fs from "fs";

const wss = new WebSocketServer({port: 8080});

// example logins
let users = [{
    username: "user",
    password: "123",
    color: "CornflowerBlue",
    pfp: getPfp("user"),
}, {
    username: "Aidan",
    password: "pass",
    color: "LightSalmon",
    pfp: getPfp("Aidan"),
}];

const MESSAGE_LEN = 100; // max message length

let clients = [] // all currently logged in users

let history = []; // all past messages sent

// create a default client object
function createClient(socket) {
    return {
        socket,
        username: `Guest`,
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

// get a users profile picture
function getPfp(username) {
    if (fs.existsSync(`./server/pfps/${username}`)) {
        return fs.readFileSync(`./server/pfps/${username}`, {encoding: "base64"});
    }
    return fs.readFileSync("./server/pfps/NoPfp", {encoding: "base64"});
}

// create a json string of a message
function message(username, msg, color) {
    return JSON.stringify({type: "message", username, msg, color});
}

// create a json string on if a login succeeded, including logged in user and message history
function loginSuccess(result, username="", history="") {
    return JSON.stringify({type: "login", success: result, username, history});
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

    let username = clients[indexOfClient(ws)].username;
    let color = clients [indexOfClient(ws)].color;
    let image = getPfp(username);

    history.push({username, msg, color, image});

    broadcast(username, msg, color);
}

// update profile pictures on client side
function updatePfpsClient(ws) {
    let pfps = {};
    
    pfps["Server"] = getPfp("Server");
    users.forEach(user => {pfps[user.username] = user.pfp});

    ws.send(JSON.stringify({type: "updatepfps", pfps}));
}

// handle a login request from a client
function handleLogin(ws, msg) {
    for (let i = 0; i < users.length; i++) {
        let login = users[i];
        if (msg.username === login.username && msg.password === login.password) {
            console.log("Logging in", login.username);
            clients[indexOfClient(ws)].username = login.username;
            clients[indexOfClient(ws)].color = login.color;
            broadcastOthers(ws, "Server", `${login.username} joined.`, "FireBrick");
            ws.send(loginSuccess(true, login.username, history));
            updatePfpsClient(ws);
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
    let image = getPfp(msg.username);

    // update color for currently logged in users
    clients[indexOfClient(ws)].color = msg.color;

    // update color and pfp in list of users
    for (let i = 0; i < users.length; i++) {
        if (users[i].username === msg.username) {
            users[i].color = msg.color;
            users[i].pfp = image;
        }
    }

    // update color in history (temp)
    for (let i = 0; i < history.length; i++) {
        if (history[i].username === msg.username) {
            history[i].color = msg.color;
            history[i].image = image;
        }
    }

    updatePfpsClient(ws);
}

// send message to all clients
function broadcast(username, msg, color) {
    clients.forEach(c => c.socket.send(message(username, msg, color)));
}

// send message to all clients except ws
function broadcastOthers(ws, username, msg, color) {
    clients.forEach(c => {
        if (c.socket === ws) return;
        c.socket.send(message(username, msg, color))
    });
}

wss.on('listening', () => {
    console.log("Listening for connections...");
})

wss.on('connection', (ws) => {
    console.log("Got connection");

    clients.push(createClient(ws));

    updatePfpsClient(ws);

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

        let username = clients[indexOfClient(ws)].username;
        if (username !== "Guest") {
            broadcast("Server", `${username} left.`, "FireBrick");
        }

        clients = clients.filter(s => s !== ws);
    });
});