const settings = document.getElementById("settings");
const settingsButton = document.getElementById("settingsButton");
const settingsBack = document.getElementById("settingsBack");

const selectColor = document.getElementById('selectColor');
const updateColor = document.getElementById('updateColor');

const body = document.getElementById("body");

settings.addEventListener("submit", (e) => e.preventDefault());

settingsButton.onclick = () => {
    main.style.filter = "blur(0.1rem)";
    button.setAttribute("disabled", "disabled");
    settingsButton.setAttribute("disabled", "disabled");

    settings.style.display = "block";
}

settingsBack.onclick = () => {
    main.style.filter = "none";
    button.removeAttribute("disabled");
    settingsButton.removeAttribute("disabled");

    settings.style.display = "none";
}

updateColor.onclick = () => {
    ws.send(JSON.stringify({
        type: "color",
        color: selectColor.value,
        username: localStorage.getItem("username"), // use a token instead
    }));
}