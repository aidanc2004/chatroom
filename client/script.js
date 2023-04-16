const ws = new WebSocket("ws://localhost:8080");

const inputForm = document.getElementById("input");
const messages = document.getElementById("messages");
const button = document.getElementById("button");
const msg = document.getElementById("msg");

const loginForm = document.getElementById("login");
const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const loginButton = document.getElementById("loginButton");

const MESSAGE_LEN = 100; // max message length
const NICK_LEN = 10; // max nickname length

inputForm.addEventListener("submit", (e) => {
    e.preventDefault(); // make sending a message not refresh the page
    msg.value = ""; // clear input field
});

// build an message element and append it to messages
function createMessage(msg) {
    let msgLi = document.createElement("li");
    let msgImg = document.createElement("img");
    let msgNick = document.createElement("p");
    let msgContent = document.createElement("p");

    msgNick.innerText = `<${msg.nick}>`;
    msgNick.id = "nick";

    msgContent.innerText = msg.msg;

    // temporary colors
    let color;
    if (msg.nick === "Server") {
        color = "FireBrick";
    } else {
        color = "CornflowerBlue";
    }

    msgImg.style.backgroundColor = color; 

    msgLi.appendChild(msgImg);
    msgLi.appendChild(msgNick);
    msgLi.appendChild(msgContent);

    messages.appendChild(msgLi);
}

// check if the nickname is the correct length and not "Server"
// returns true if valid, false if invalid
function checkNickname(msg) {
    // get nickname
    let nick = msg.split(" "); 
    nick.shift();
    nick = nick.join();

    // check length
    if (nick.length > NICK_LEN) {
        alert(`Nickname must be under ${NICK_LEN} characters.`);
        return false;
    }

    if (nick === "Server") {
        alert("Invalid nickname.");
        return false;
    }

    return true;
}

function handleLogin(login) {
    if (login.success) {
        alert("Successfully logged in.");
    } else {
        alert("Failed to login");
    }
}

ws.onopen = () => {
    console.log("Connection created");
}

// recieving a message
ws.onmessage = (e) => {
    let msg = JSON.parse(e.data); // parse from json to string

    if (msg.type === "message") {
        createMessage(msg);
        return;
    }

    if (msg.type === "login") {
        handleLogin(msg);
        return;
    }
}

// send a message
button.onclick = () => {
    // if trying to send an empty message
    if (msg.value.trim() === "") {
        return;
    }

    if (msg.value.length > MESSAGE_LEN) {
        alert(`Messages must be under ${MESSAGE_LEN} characters.`);
        return;
    }

    if (msg.value.startsWith("/nick")) {
        // if the nickname is invalid, just return
        if (!checkNickname(msg.value)) {
            return;
        }
    }

    ws.send(JSON.stringify({
        type: "message",
        content: msg.value
    }));
};

// login is obviously unsecure, this is just a prototype so i will fix this
loginButton.onclick = () => {
    let username = userInput.value;
    let password = passInput.value;

    ws.send(JSON.stringify({
        type: "login",
        username,
        password,
    }));
};