const ws = new WebSocket("ws://localhost:8080");

const inputForm = document.getElementById("input");
const messages = document.getElementById("messages");
const button = document.getElementById("button");
const msg = document.getElementById("msg");

inputForm.addEventListener("submit", (e) => {
    e.preventDefault(); // make sending a message not refresh the page
    msg.value = ""; // clear input field
});

ws.onopen = () => {
    console.log("Connection created");
}

// recieving a message
ws.onmessage = (e) => {
    let msg = JSON.parse(e.data); // parse from json to string

    let msgLi = document.createElement("li");
    msgLi.innerText = `<${msg.nick}> ${msg.msg}`;
    messages.appendChild(msgLi);
}

// send a message
button.onclick = () => {
    // if trying to send an empty message
    if (msg.value.trim() === "") {
        return;
    }

    ws.send(msg.value);
}