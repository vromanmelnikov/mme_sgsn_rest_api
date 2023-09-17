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

const SGW_DATA = {
    RAI: '250-20-58875-232',
    IP: 'http://localhost:5014'
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

async function createSession(res, message) {

    const PGW_IP = message.F_TEID.filter(f_teid => f_teid.INTERFACE_TYPE == 'S5/S8')[0].F_TEID_IPV4

    let user = {
        IMSI: message.IMSI,
        APN: message.APN,
        EPS_BEARER_ID: message.EPS_BEARER_ID,
        PGW_IP
    }

    const reqBody = {
        ...message,
        F_TEID: [
            {
                INTERFACE_TYPE: "S5/S8-C",
                F_TEID_IPV4: SGW_DATA.IP
            },
            {
                INTERFACE_TYPE: "S5/S8-U",
                F_TEID_IPV4: SGW_DATA.IP
            }
        ]
    }

    const response = await requestPromise({
        method: 'POST',
        uri: `${PGW_IP}/S5`,
        body: { ...reqBody },
        json: true
    })

    user.EPS_BEARER_ID = response.EPS_BEARER_ID

    users.push({...user})

    res.status(200).json({ ...response })

}

function modifyBearer(res, message) {

    const resBody = {
        type: 'MODIFY_BEARER_RESPONSE',
        BEARER_CONTEXT: {
            EPS_BEARER_ID: message.EPS_BEARER_ID,
            F_TEID: [
                {
                    INTERFACE_TYPE: "S1-U-SGW",
                    F_TEID_IPV4: SGW_DATA.IP
                },
            ]
        }
    }

    res.status(200).json({ ...resBody })

}

function checkMessage(res, message) {

    console.log(message)

    switch (message.type) {

        case 'CREATE_SESSION_REQUEST': {
            createSession(res, message)
            break
        }
        case 'MODIFY_BEARER_REQUEST': {
            modifyBearer(res, message)
            break
        }
        case 'DELETE_SESSION_REQUEST': {

            const EPS_BEARER_ID = message.EPS_BEARER_ID

            const user = users.filter(user => user.EPS_BEARER_ID == EPS_BEARER_ID)[0]

            const reqBody = {
                type: 'DELETE_SESSION_REQUEST',
                EPS_BEARER_ID: EPS_BEARER_ID,
                F_TEID: [
                    {
                        INTERFACE_TYPE: 'S5/S8-C',
                        F_TEID_IPV4: SGW_DATA.IP
                    }
                ],
                TEID: '',
                TAI: '',
                ECGI: ''
            }

            requestPromise({
                method: 'POST',
                uri: `${user.PGW_IP}/S5`,
                body: { ...reqBody },
                json: true
            })

            users = users.filter(user => user.EPS_BEARER_ID != EPS_BEARER_ID)

            break
        }
        default: {

        }
    }
}

app.post('/S11', (req, res) => {

    const message = req.body

    checkMessage(res, message)

})

const PORT = 5014
server.listen(PORT, () => {
    console.log('S-GW is working!')
})