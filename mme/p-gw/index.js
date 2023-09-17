const express = require('express')
const cors = require('cors')
const http = require('http')
const requestPromise = require('request-promise')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

function logger(message) {

    const body = { ...message }
    const type = body.type
    delete body['type']
    const args = { ...body }

    const argsPair = Object.entries(args)

    console.log()
    console.log()
    console.log('* * * * * * * *')
    console.log()
    console.log(`Type: ${type}`)
    console.log()
    for (let i = 0; i < argsPair.length; i++) {
        console.log(`${argsPair[i][0]}: ${argsPair[i][1]}`)
    }
    console.log()
    console.log('* * * * * * * *')
    console.log()
    console.log()

}

app.use(
    (req, res, next) => {
        const message = { ...req.body }
        logger(message)
        next()
    }
)

let users = []

const PGW_DATA = {
    RAI: '250-20-58875-232',
    IP: 'http://localhost:5013'
}

function createPTMSI() {
    return '3234349115'
}

function getMSData(IMEISV) {
    return ({
        IMSI: '250203908244998',
        MSISDN: '79308190001'
    })
}

function createSession(res, message) {

    // const SGW_IP = message.F_TEID.filter(f_teid => f_teid.INTERFACE_TYPE == 'S5/S8-C')[0].F_TEID_IPV4

    const resBody = {
        type: 'CREATE_SESSION_RESPONSE',
        F_TEID: [
            {
                INTERFACE_TYPE: "S5/S8-C",
                F_TEID_IPV4: PGW_DATA.IP
            },
            {
                INTERFACE_TYPE: "S5/S8-U",
                F_TEID_IPV4: PGW_DATA.IP
            }
        ],
        PDP_ADDRESS_ALLOCATION: '10.54.6.200',
        EPS_BEARER_ID: 5,
        CHARGING_ID: '0x06F31A5E'
    }

    res.status(200).json({...resBody })

}

function modifyBearer(res, message) {


    const resBody = {
        type: 'MODIFY_BEARER_RESPONSE'
    }

    res.status(200).json({
        ...resBody
    }) 

}

function checkMessage(res, message) {

    switch (message.type) {

        case 'CREATE_SESSION_REQUEST': {
            createSession(res, message)
            break
        }
        case 'MODIFY_BEARER_REQUEST': {
            modifyBearer(res, message)
            break
        }
        default: {

        }
    }
}

app.post('/S5', (req, res) => {

    const message = req.body

    checkMessage(res, message)

})

const PORT = 5013
server.listen(PORT, () => {
    console.log('P-GW is working!')
})