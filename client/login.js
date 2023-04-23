const loginForm = document.getElementById("login");
const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");
const info = document.getElementById("info");
const main = document.getElementById("main");

const color = document.getElementById('color');
const updateColor = document.getElementById('updateColor');

loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // make sending a message not refresh the page
});

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

updateColor.onclick = () => {
    let username = localStorage.getItem("username");
    
    ws.send(JSON.stringify({
        type: "color",
        color: color.value,
        username, // use a token instead
    }));
}

function handleLogin(login) {
    if (login.success) {
        main.style.display = "block";
        loginForm.style.display = "none";

        localStorage.setItem("username", login.username);
    } else {
        info.innerText = "Failed to login."
    }
}

function handleSignUp(signup) {
    if (signup.success) {
        // login new user
        loginButton.onclick();
    } else {
        info.innerText = "User already exists";
    }
}