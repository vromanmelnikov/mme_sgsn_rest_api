const express = require('express')
const cors = require('cors')
const http = require('http')
const request = require('request')
const requestPromise = require('request-promise')
const { DNS_URL } = require('./services/api.config')

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

        const key = argsPair[i][0]
        const value = argsPair[i][1]

        if (typeof (value) == 'object') {
            for (let j = 0; j < value.length; j++) {
                console.log(value[j])
            }
        }
        else {
            console.log(`${key}: ${value}`)
        }
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

const SGSN_DATA = {
    RAI: '250-20-58875-232',
    IP: 'http://localhost:5002'
}

const MME_DATA = {
    TAI: '',
    TAC: '58882',
    IP: 'http://localhost:5012'
}

function createPTMSI() {
    return '3234349115'
}

function getMSData(IMEISV) {

    const HSS = {
        '': {
            IMSI: '250203908244998',
            MSIDN: '79308190001'
        }
    }

    return HSS[IMEISV]

}

function addUser(newUser) {

    for (let i = 0; i < users.length; i++) {
        if (users[i].GUTI === newUser.GUTI) {
            users[i] = { ...newUser }
        }
        break
    }

    users.push({ ...newUser })

}

function checkIMEISV(message) {

    const ENB_UE_S1AP_ID = message.ENB_UE_S1AP_ID
    const IMEISV = message.IMEISV

    for (let i = 0; i < users.length; i++) {
        if (users[i].ENB_UE_S1AP_ID === ENB_UE_S1AP_ID) {
            users[i].IMEISV = IMEISV

            const data = getMSData(IMEISV)

            users[i].IMSI = data.IMSI
            users[i].MSIDN = data.MSIDN
        }
    }

}

function authenticate(res, message) {

    const MME_UE_S1AP_ID = Math.random()
    const { TAI, GUTI, ENB_UE_S1AP_ID } = { ...message }

    const user = {
        GUTI,
        ENB_UE_S1AP_ID,
        MME_UE_S1AP_ID
    }

    addUser(user)

    const resBody = {
        type: 'AUTHENTICATION_REQUEST',
        ENB_UE_S1AP_ID,
        MME_UE_S1AP_ID,
        AUTN: '',
        RAND: ''
    }

    logger(resBody)

    res.status(200).json(resBody)

}

function securityFunction(res, message) {

    const { MME_UE_S1AP_ID, ENB_UE_S1AP_ID } = { ...message }

    const resBody = {
        type: 'SECURITY_MODE_COMMAND',
        MME_UE_S1AP_ID,
        ENB_UE_S1AP_ID
    }

    logger(resBody)

    res.status(200).json(resBody)

}

function esmRequest(res, message) {

    const { MME_UE_S1AP_ID, ENB_UE_S1AP_ID } = { ...message }

    const resBody = {
        type: 'ESM_INFORMATION_REQUEST',
        ENB_UE_S1AP_ID,
        MME_UE_S1AP_ID
    }

    logger(resBody)

    res.status(200).json(resBody)

}

function defineName(name) {

    return requestPromise({
        method: 'POST',
        uri: `${DNS_URL}/Gn`,
        body: {
            name
        },
        json: true
    })

}

async function createSession(res, message) {

    const { APN, MME_UE_S1AP_ID, ENB_UE_S1AP_ID } = { ...message }

    const SGW_IP = (await defineName(MME_DATA.TAC)).ip
    const PGW_IP = (await defineName(APN)).ip

    const user = users.filter(user => user.MME_UE_S1AP_ID == MME_UE_S1AP_ID)[0]

    const reqBody = {
        type: 'CREATE_SESSION_REQUEST',
        IMSI: user.IMSI,
        MSIDN: user.MSIDN,
        IMEISV: user.IMEISV,
        APN,
        F_TEID: [
            {
                INTERFACE_TYPE: "S11",
                F_TEID_IPV4: MME_DATA.IP
            },
            {
                INTERFACE_TYPE: "S5/S8",
                F_TEID_IPV4: PGW_IP
            }
        ]
    }

    logger(reqBody)

    const sgwResponse = await requestPromise({
        method: 'POST',
        uri: `${SGW_IP}/S11`,
        body: { ...reqBody },
        json: true
    })

    console.log('SGW fetched')

    const resBody = {
        type: 'INITIAL_CONTEXT_SETUP_REQUEST/ATTACH_ACCEPT/ACTIVATE_DEFAULT_EPS_BEARER_CONTEXT_REQUEST',
        MME_UE_S1AP_ID,
        ENB_UE_S1AP_ID,
        EPS_BEARER_ID: sgwResponse.EPS_BEARER_ID,
        GTP_TEID: '',
        TRANSPORT_LAYER_ADDRESS: '',
        NAS_PDU: {
            TAI: MME_DATA.TAI,
            LAI: '',
            P_TMSI: createPTMSI(),
            APN,
            PDN_ADDRESS: sgwResponse.PDP_ADDRESS_ALLOCATION
        }
    }

    logger(resBody)

    res.status(200).json(resBody)

    for (let i = 0; i < users.length; i++) {
        if (users[i].MME_UE_S1AP_ID === MME_UE_S1AP_ID) {
            users[i].SGW_IP = SGW_IP
            users[i].EPS_BEARER_ID = sgwResponse.EPS_BEARER_ID
        }
        break
    }

}

async function modifyBearer(res, message) {

    const user = users.filter(user => user.MME_UE_S1AP_ID == message.MME_UE_S1AP_ID)[0]

    const SGW_IP = user.SGW_IP

    const reqBody = {
        type: 'MODIFY_BEARER_REQUEST',
        TEID: '',
        BEARER_CONTEXT: {
            EPS_BEARER_ID: user.EPS_BEARER_ID,
            F_TEID: [
                {
                    INTERFACE_TYPE: "S1-U/eNodeB",
                    F_TEID_IPV4: 'http://127.0.0.1:5011'
                },
            ]
        }
    }

    logger(reqBody)

    const response = await requestPromise({
        method: 'POST',
        uri: `${SGW_IP}/S11`,
        body: { ...reqBody },
        json: true
    })

    logger(response)

}


function checkMessage(res, message) {

    switch (message.type) {

        case 'INITIAL_UE_MESSAGE/ATTACH_REQUEST/PDP_CONNECTIVITY_REQUEST': {
            authenticate(res, message)
            break
        }
        case 'AUTHENTICATION_RESPONSE': {
            securityFunction(res, message)
            break
        }
        case 'SECURITY_MODE_COMPLETE': {
            checkIMEISV(message)
            esmRequest(res, message)
            break
        }
        case 'ESM_INFORMATION_RESPONSE': {
            createSession(res, message)
            break
        }
        case 'CREATE_SESSION_RESPONSE': {
            //TODO
            break
        }
        case 'ATTACH_COMPLETE': {
            res.status(200).end()
            modifyBearer(res, message)
            break
        }
        case 'MODIFY_BEARER_RESPONSE': {
            //TODO
            break
        }
        case 'DETACH_REQUEST': {

            const ENB_UE_S1AP_ID = message.ENB_UE_S1AP_ID

            user = users.filter(user => user.ENB_UE_S1AP_ID == ENB_UE_S1AP_ID)[0]

            const reqBody = {
                type: 'DELETE_SESSION_REQUEST',
                EPS_BEARER_ID: user.EPS_BEARER_ID,
                F_TEID: [
                    {
                        INTERFACE_TYPE: 'S11 MME',
                        F_TEID_IPV4: MME_DATA.IP
                    }
                ],
                TEID: '',
                TAI: '',
                ECGI: ''
            }

            requestPromise({
                method: 'POST',
                uri: `${user.SGW_IP}/S11`,
                body: { ...reqBody },
                json: true
            })

            users = users.filter(user => user.ENB_UE_S1AP_ID != ENB_UE_S1AP_ID)

            break
        }
        default: {

        }
    }
}

app.post('/S1', (req, res) => {

    const message = req.body

    checkMessage(res, message)

})

const PORT = 5012
server.listen(PORT, () => {
    console.log('MME is working!')
})