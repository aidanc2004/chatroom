const settings = document.getElementById("settings");
const settingsButton = document.getElementById("settingsButton");
const settingsBack = document.getElementById("settingsBack");

const selectColor = document.getElementById('selectColor');
const updateColor = document.getElementById('updateColor');

settings.addEventListener("submit", (e) => e.preventDefault());

settingsButton.onclick = () => {
    main.style.display = "none";
    settings.style.display = "block";
}

settingsBack.onclick = () => {
    main.style.display = "block";
    settings.style.display = "none";
}

updateColor.onclick = () => {
    ws.send(JSON.stringify({
        type: "color",
        color: selectColor.value,
        username: localStorage.getItem("username"), // use a token instead
    }));
}