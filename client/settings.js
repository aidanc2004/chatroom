const settings = document.getElementById("settings");
const settingsButton = document.getElementById("settingsButton");
const settingsBack = document.getElementById("settingsBack");

settings.addEventListener("submit", (e) => e.preventDefault());

settingsButton.onclick = () => {
    main.style.display = "none";
    settings.style.display = "block";
}

settingsBack.onclick = () => {
    main.style.display = "block";
    settings.style.display = "none";
}