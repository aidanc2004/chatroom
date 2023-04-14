const socket = new WebSocket("ws://localhost:8080");

const message = document.getElementById("message");

socket.onopen = () => {
    console.log("Connection created");
}

socket.onmessage = (e) => {
    console.log("Got data:", e.data);
    message.innerText = e.data;
}