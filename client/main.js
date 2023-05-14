const ws = new WebSocket("ws://localhost:8080");

const inputForm = document.getElementById("input");
const messages = document.getElementById("messages");
const button = document.getElementById("button");
const msg = document.getElementById("msg");

const MESSAGE_LEN = 100; // max message length

let pfps = {}; // users and their profile pictures

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

    username.innerText = `<${msg.username}>`;
    username.id = "username";

    content.innerText = msg.msg;

    //pfp.src = "data:image/png;base64," + msg.image;
    pfp.src = "data:image/png;base64," + pfps[msg.username];
    username.style.color = msg.color;

    li.appendChild(pfp);
    li.appendChild(username);
    li.appendChild(content);

    messages.appendChild(li);

    // automatically scroll down to new message
    messages.scrollTop = messages.scrollHeight;
}

ws.onopen = () => {
    console.log("Connected to server.");
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
        case "updatepfps":
            pfps = msg.pfps;
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

    ws.send(JSON.stringify({
        type: "message",
        content: msg.value
    }));
};