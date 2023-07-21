const socket = io();

const form = document.getElementById("form");
const message = document.getElementById("input");
const messages = document.getElementById("messages");

let username;

function displayMessage(message, username) {
    const msgli = document.createElement("li");

    msgli.innerHTML = `<strong>${username}</strong> <p>${message}</p>`;
    messages.appendChild(msgli);

    window.scrollTo(0, document.body.scrollHeight);
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

function getUsername(unStatus) {
    switch (unStatus) {
        case 0:
            if (getCookie("username")) {
                return getCookie("username");
            } else {
                return prompt("Enter username: ");
            }
        case 1:
            return prompt(
                "ERROR: Username contains illegal characters.\nEnter username: "
            );
        case 2:
            return prompt(
                "ERROR: Username is reserved or disallowed.\nEnter username: "
            );
        default:
            return prompt(
                "ERROR: Recieved unknown error from server.\nEnter username: "
            );
    }
}

socket.on("get username", function (status) {
    socket.emit("username", getUsername(status));
});

socket.on("username success", function (username) {
    document.cookie = `uname=${username}`;
    socket.on("connected", function () {
        displayMessage(`${username} has connected.`, "[SERVER]");
    });

    socket.on("disconnected", function () {
        displayMessage(`${username} has disconnected.`, "[SERVER]");
    });

    socket.on("message", function (message) {
        displayMessage(message, username);
    });
});
