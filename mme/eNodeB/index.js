const express = require('express')
const cors = require('cors')
const http = require('http')
const ws = require('ws')
const request = require('request')
const mmeService = require('./services/mme.service')

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

wss.on('connection', (socket) => {

    const id = addUser(socket)

    const mme = mmeService(socket)

    socket.on('close', () => {
        deleteUser(id)
        console.log('MS disc')
        mme.sendMessage({
            type: 'DETACH_REQUEST',
            ENB_UE_S1AP_ID: id
        })
    })
    socket.on('message', (data) => {

        try {

            let message = JSON.parse('' + data)
            message.ENB_UE_S1AP_ID = id
            mme.sendMessage(message)

        }
        catch (err) {
            console.log(err)
        }
    })
})

const PORT = 5011
server.listen(PORT, () => {
    console.log('eNodeB is working!')
})