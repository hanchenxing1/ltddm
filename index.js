const path = require("path");
const ejs = require("ejs");

const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    console.log("NET: recieved request for /");
    res.render("index");
});

// Username processing callbacks
const allowedChars = "abcdefghijklmnopqrstuvwxyz1234567890_";
const invalidUsers = ["server", "admin"];

function checkChars(username) {
    for (let i = 0; i <= username.length; i++) {
        if (allowedChars.indexOf(username[i].toLowerCase()) === -1) {
            return false;
        }

        return true;
    }
}

io.on("connection", async (socket) => {
    function getUsername() {
        console.log("in getUsername", socket);

        return new Promise((resolve, reject) => {
            console.log("in username promise");
            socket.resolvePromise = resolve;
            socket.emit("get username", 0);
            console.log("Sent username request");

            socket.on("username", (username) => {
                console.log("received username response");
                console.log(socket, username);
                 // WHY IS socket = "e" and username = null AAA
                if (!checkChars(username)) {
                    // ......... I think I found the culprit
                    console.log("username fail type 1", username);
                    socket.emit("get username", 1);
                } else if (invalidUsers.includes(username.toLowerCase())) {
                    console.log("username fail type 2", username);
                    socket.emit("get username", 2);
                } else {
                    socket.username = username;
                    socket.emit("username success", username);
                    
                    console.log("username success", username);
                    socket.resolvePromise(username); // OMG WHY IS SOCKET.IO SO COMPLICATED WHAT IS ENULL AAAAAAA FR its absolutely rediculous Not like the documentation.
                    //Are you sure you installed the right socket.io? not the russian spammy one? lol uuh i think? idk i installed the one the documentation said to install
                }
            });
        });
    }

    //const username = getUsername(allowedChars, invalidUsers);
    console.log("before username await");
    let username = await getUsername(socket);
    console.log("after username await");

    socket.broadcast.emit("connected", username);
    console.log(`${username} has connected`);

    socket.on("message", (message) => {
        socket.broadcast.emit("message", message, username);
        console.log(`${username}: ${message}`);
    });
    socket.on("disconnect", (username) => {
        socket.broadcast.emit("disconnected");
        console.log(`${username} has disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`Listening on *:${PORT}`);
});
