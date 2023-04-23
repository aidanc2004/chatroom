const loginForm = document.getElementById("login");
const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");
const info = document.getElementById("info");
const main = document.getElementById("main");
const selectColor = document.getElementById('selectColor');
const updateColor = document.getElementById('updateColor');

function login(username, password) {
    return JSON.stringify({
        type: "login",
        username,
        password,
    });
}

function signup(username, password) {
    return JSON.stringify({
        type: "signup",
        username,
        password,
    });
}

loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // make sending a message not refresh the page
});

// login is obviously unsecure, this is just a prototype so i will fix this
loginButton.onclick = () => {
    ws.send(login(userInput.value, passInput.value));
};

signupButton.onclick = () => {
    ws.send(signup(userInput.value, passInput.value));
}

updateColor.onclick = () => {
    ws.send(JSON.stringify({
        type: "color",
        color: selectColor.value,
        username: localStorage.getItem("username"), // use a token instead
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