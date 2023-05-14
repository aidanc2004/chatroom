const settings = document.getElementById("settings");
const settingsButton = document.getElementById("settingsButton");
const settingsBack = document.getElementById("settingsBack");
const selectColor = document.getElementById('selectColor');
const updateSettings = document.getElementById('updateSettings');
const selectPfp = document.getElementById("selectPfp");

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

updateSettings.onclick = () => {
    const file = selectPfp.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
        ws.send(JSON.stringify({
            type: "settings",
            color: selectColor.value,
            pfp: reader.result,
            username, // use a token instead
        }));   
    }
}