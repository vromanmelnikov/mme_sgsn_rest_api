const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

let users = []

const ggsnData = {
    IP: 'http://localhost:5003'
}

const ipAddresses = {
    '10.53.127.16': false
}

function getFreeAddress() {

    const IPs = Object.keys(ipAddresses)

    for (let i = 0; i < IPs.length; i++) {
        if (ipAddresses[IPs[i]] === false) {
            return IPs[i]
        }
    }

}

function createPdpContext(res, message) {

    const userCheck = users.filter(user => user.IMSI === message.IMSI)

    if (userCheck.length === 0) {

        const IP = getFreeAddress()

        const user = { ...message, IP }

        users.push({ ...user })

        res.status(200).json({
            type: 'CREATE_PDP_CONTEXT_RESPONSE',
            END_USER_ADDRESS: user.IP,
            GSN_ADDRESS: ggsnData.IP,
            TEID: user.TEID,
            TEID_DATA: "",
            TEID_CONTROL_PLANE: "",
            CHARGIND_ID: ""
        })
    }
    else {

        const user = userCheck[0]

        res.status(200).json({
            type: 'CREATE_PDP_CONTEXT_RESPONSE',
            END_USER_ADDRESS: user.IP,
            GSN_ADDRESS: ggsnData.IP,
            TEID: "",
            TEID_DATA: "",
            TEID_CONTROL_PLANE: "",
            CHARGIND_ID: ""
        })
    }
}
 
function deletePDPContext(res, message) {

    const NSAPI = message.NSAPI

    users = users.filter(user => user.NSAPI !== NSAPI)

    res.status(200).json({
        type: 'DELETE_PDP_CONTEXT_RESPONSE'
    })

}

app.post('/Gn', (req, res) => {

    const message = req.body
    // console.log('Message from SGSN...\n', message)

    switch (message.type) {
        case 'CREATE_PDP_CONTEXT_REQUEST': {
            createPdpContext(res, message)
            break
        }
        case 'DELETE_PDP_CONTEXT_REQUEST': {
            deletePDPContext(res, message)
            break
        }
        default: {

        }
    }

})

const PORT = 5003
server.listen(PORT, () => {
    console.log('GGSN is working!')
})