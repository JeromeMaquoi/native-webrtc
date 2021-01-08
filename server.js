const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const rooms = {};

io.on("connection", socket => {
    socket.on("join room", roomID => {
        // S'il existe une room dont l'id est roomID, on ajoute l'ID du socket dans rooms[roomID] autres déjà existants
        // Sinon on crée rooms[roomID] et on met l'ID du socket dedans
        console.log(typeof roomID);
        console.log(typeof rooms);
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        // On regarde s'il existe d'autres utilisateurs présents dans cette room
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if (otherUser) {
            // Si c'est le cas, on envoie les ID des autres sockets dans la room au socket qui vient de se connecter dans la room
            socket.emit("other user", otherUser);
            // On envoie l'id du nouveau socket arrivé dans la room à l'ensemble des sockets déjà présents dans la room
            socket.to(otherUser).emit("user joined", socket.id);
        }
    });

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
});


server.listen(8000, () => console.log('server is running on port 8000'));
