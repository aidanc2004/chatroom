const ws = new WebSocket("ws://localhost:8080");

const message = document.getElementById("message");
const button = document.getElementById("button");
const msg = document.getElementById("msg");

ws.onopen = () => {
    console.log("Connection created");
}

ws.onmessage = (e) => {
    let msg = JSON.parse(e.data); // parse from json to string
    console.log("Got data:", msg);
    message.innerText = msg;
}

button.onclick = () => {
    console.log("Sending:", msg.value);
    ws.send(msg.value);
}