require("dotenv").config();
const express = require('express')
const cors = require('cors')

const dataRouter = require('./routes/data');

const app = express()

//configrations
var corOptions = {
    origin: '*'
}

//middle ware;
app.use(cors(corOptions))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))


app.use("/data", dataRouter)

app.get('/', (req, res) => {
    res.status(200).json({ success: true, data: "Chat App Backend", message: "Welcome" })
})

module.exports = app;