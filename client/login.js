const loginForm = document.getElementById("login");
const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");
const info = document.getElementById("info");

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

function handleLogin(login) {
    if (login.success) {
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