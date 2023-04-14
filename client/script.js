const ws = new WebSocket("ws://localhost:8080");

const messages = document.getElementById("messages");
const button = document.getElementById("button");
const msg = document.getElementById("msg");

messages.value = ""; // clear textarea on refresh

ws.onopen = () => {
    console.log("Connection created");
}

ws.onmessage = (e) => {
    let msg = JSON.parse(e.data); // parse from json to string
    console.log("Got data:", msg);
    messages.value += msg+'\n';
}

button.onclick = () => {
    console.log("Sending:", msg.value);
    ws.send(msg.value);
}