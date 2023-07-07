const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require('mongoose')
const connectDB = require("./config/db");
const userRoute = require('./routes/userRoute')
const msgRoute = require('./routes/msgRoute')
const chatRoute = require('./routes/chatRoute')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');

dotenv.config();
connectDB()
app.use(bodyParser.json({ limit: '10mb' }));
const { Chats } = require("./data/data");
app.use(cors())
app.use(express.json())



app.use('/user', userRoute)
app.use('/msg', msgRoute)
app.use('/chat', chatRoute)

const PORT = process.env.PORT || 4002
// console.log(PORT)

app.listen(PORT, console.log("server initiated at port", PORT))
