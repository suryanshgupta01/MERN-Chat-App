const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoute = require('./routes/userRoute')
const msgRoute = require('./routes/msgRoute')
const chatRoute = require('./routes/chatRoute')
const bodyParser = require('body-parser');

dotenv.config();
connectDB()
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send("Server is up and running")
})

app.use('/user', userRoute)
app.use('/msg', msgRoute)
app.use('/chat', chatRoute)

const PORT = process.env.PORT || 4002

const server = app.listen(PORT, console.log("server initiated at port", PORT))

const io = require("socket.io")(server
    , {
        pingTimeout: 30000,
        cors: {
            // origin: "http://localhost:3000",
            origin: "https://suryansh-mern-chat-app.netlify.app"
        },
    }
);

io.on("connection", (socket) => {
    // console.log("Connected to socket.io",socket.id);
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        // console.log(userData._id, "connected");
        socket.emit("connected");
    });

    socket.on('join chat', (room) => {
        socket.join(room)
        // console.log('joined room', room)
    })

    socket.on('new msg', (msg) => {
        // console.log('new msg', msg)
        socket.in(msg.reciever).emit('msg received', msg)
    })

    socket.on('typing', ({ room, typer }) => {
        socket.in(room).emit('typing', typer)
    })

    socket.on('stoptyping', (room) => {
        socket.in(room).emit('stoptyping')
    })

    socket.off("setup", () => {
        // console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});