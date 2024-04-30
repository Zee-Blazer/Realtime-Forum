const path = require('path');
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require('bad-words');

// Users Records
const { addUser, removeUser, getUser, getUsersInRoom  } = require('./utils/users');

const { generateMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {

    socket.on("join", (options, cb) => {
        const { err, user } = addUser({ id: socket.id, ...options });

        if(err){
            return cb(err);
        }

        socket.join(user.room)

        socket.emit("message", generateMessage("Admin","Welcome!"));
        socket
            .broadcast
            .to(user.room)
            .emit(
                "message", 
                generateMessage(user.username, `${user.username} has joined!`)
            );
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        cb();

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    })

    socket.on('sendMsg', (msg, cb) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(msg)){
            return cb("Profanity is not allowed!")
        }

        io.to(user.room).emit("message", generateMessage(user.username, msg));
        cb();
    })

    socket.on("sendLocation", (coords, cb) => {
        const user = getUser(socket.id);
        io.to(user.room).emit(
            "locationMessage", 
            generateMessage(
                user.username, 
                `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
            )
        );
        cb();
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if(user){
            io
                .to(user.room)
                .emit(
                    "message", 
                    generateMessage(user.username,`${user.username} has left`)
                );
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }

    });

})

const port = process.env.PORT || 3004;

server.listen(port, () => console.log(`Server is running on Port:${port}`));
