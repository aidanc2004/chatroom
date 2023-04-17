const ws = new WebSocket("ws://localhost:8080");

const inputForm = document.getElementById("input");
const messages = document.getElementById("messages");
const button = document.getElementById("button");
const msg = document.getElementById("msg");

const loginForm = document.getElementById("login");
const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");

const MESSAGE_LEN = 100; // max message length

inputForm.addEventListener("submit", (e) => {
    e.preventDefault(); // make sending a message not refresh the page
    msg.value = ""; // clear input field
});

// build an message element and append it to messages
function createMessage(msg) {
    let li = document.createElement("li");
    let pfp = document.createElement("img");
    let username = document.createElement("p");
    let content = document.createElement("p");

    username.innerText = `<${msg.nick}>`;
    username.id = "nick";

    content.innerText = msg.msg;

    pfp.style.backgroundColor = msg.color; 
    username.style.color = msg.color;

    li.appendChild(pfp);
    li.appendChild(username);
    li.appendChild(content);

    messages.appendChild(li);

    // automatically scroll down to new message
    messages.scrollTop = messages.scrollHeight;
}

function handleLogin(login) {
    if (login.success) {
        alert("Successfully logged in.");
    } else {
        alert("Failed to login");
    }
}

function handleSignUp(signup) {
    if (signup.success) {
        alert("Successfully signed up.");
    } else {
        alert("User already exists.");
    }
}

ws.onopen = () => {
    console.log("Connection created");
}

// recieving a message
ws.onmessage = (e) => {
    let msg = JSON.parse(e.data); // parse from json to string

    switch (msg.type) {
        case "message":
            createMessage(msg);
            break;
        case "login":
            handleLogin(msg);
            break;
        case "signup":
            handleSignUp(msg);
            break;
        default:
            break;
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

    // if (msg.value.startsWith("/nick")) {
    //     // if the nickname is invalid, just return
    //     if (!checkNickname(msg.value)) {
    //         return;
    //     }
    // }

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

signupButton.onclick = () => {
    let username = userInput.value;
    let password = passInput.value;

    ws.send(JSON.stringify({
        type: "signup",
        username,
        password,
    }));
}