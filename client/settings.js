const settings = document.getElementById("settings");
const settingsButton = document.getElementById("settingsButton");
const settingsBack = document.getElementById("settingsBack");

const selectColor = document.getElementById('selectColor');
const updateColor = document.getElementById('updateColor');

settings.addEventListener("submit", (e) => e.preventDefault());

settingsButton.onclick = () => {
    // blur background
    messages.style.filter = "blur(0.1rem)";
    inputForm.style.filter = "blur(0.1rem)";
    button.setAttribute("disabled", "disabled");
    settingsButton.setAttribute("disabled", "disabled");

    // show settings panel
    settings.style.display = "block";
}

settingsBack.onclick = () => {
    // unblur background
    messages.style.filter = "none";
    inputForm.style.filter = "none";
    button.removeAttribute("disabled");
    settingsButton.removeAttribute("disabled");

    // hide settings panel
    settings.style.display = "none";
}

updateColor.onclick = () => {
    ws.send(JSON.stringify({
        type: "color",
        color: selectColor.value,
        username: localStorage.getItem("username"), // use a token instead
    }));
}