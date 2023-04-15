const ws = new WebSocket("ws://localhost:8080");

const messages = document.getElementById("messages");
const button = document.getElementById("button");
const msg = document.getElementById("msg");

ws.onopen = () => {
    console.log("Connection created");
}

ws.onmessage = (e) => {
    let msg = JSON.parse(e.data); // parse from json to string

    //console.log("Got data:", msg);

    let msgLi = document.createElement("li");
    msgLi.innerText = `<${msg.nick}> ${msg.msg}`;
    messages.appendChild(msgLi);
}

button.onclick = () => {
    //console.log("Sending:", msg.value);
    ws.send(msg.value);
}