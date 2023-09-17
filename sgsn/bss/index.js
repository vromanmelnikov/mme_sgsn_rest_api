const express = require('express')
const cors = require('cors')
const http = require('http')
const ws = require('ws')
const sgsnService = require('./services/sgsn.service')
const request = require('request')

const app = express()
const server = http.createServer(app)
const wss = new ws.Server({ server }) 

app.use(cors())
app.use(express.json())

let users = []

function addUser(socket) {
    const id = Math.random()
    users.push({
        id,
        socket
    })
    return id
}

function deleteUser(id) {
    users = users.filter(user => user.id != id)
}

function checkMessageType(socket, message) {

    const SGSN = sgsnService(socket, message)
    SGSN.sendMessageToSGSN()

} 

wss.on('connection', (socket) => {

    const id = addUser(socket)

    socket.on('close', () => {
        deleteUser(id)
        // console.log('MS disc')
    })
    socket.on('message', (data) => {

        try {

            const message = JSON.parse('' + data)

            checkMessageType(socket, message)

        }
        catch (err) {
            console.log(err)
        }
    })
})

const PORT = 5001
server.listen(PORT, () => {
    console.log('BSS is working!')
})