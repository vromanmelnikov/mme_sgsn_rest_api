const express = require('express')
const cors = require('cors')
const http = require('http')
const request = require('request')
const { DNS_URL } = require('./services/api.config')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

function logger(message) {

    const body = {...message}
    const type = body.type
    delete body['type']
    const args = {...body}

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
        const message = {...req.body}
        logger(message)
        next()
    }
)

let users = []

const SGSN_DATA = {
    RAI: '250-20-58875-232',
    IP: 'http://localhost:5002'
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

function identifyRequest(res, message) {

    const userCheck = users.filter(user => user.P_TMSI === message.P_TMSI)

    if (userCheck.length === 0) {
        users.push({
            P_TMSI: message.P_TMSI
        })
    }

    res.status(200).json({
        message: '',
        type: 'IDENTIFY_REQUEST'
    })
}

function authenticate(res, message) {

    const P_TMSI = message.P_TMSI

    for (let i = 0; i < users.length; i++) {
        if (users[i].P_TMSI === P_TMSI) {

            users[i].IMEISV = message.IMEISV
            //получение данных из HLR/AUC

            const P_TMSI = createPTMSI()
            const data = getMSData(message.IMEISV)

            users[i].IMSI = data.IMSI
            users[i].MSISDN = data.MSISDN

            res.status(200).json({
                RAI: SGSN_DATA.RAI,
                P_TMSI,
                type: 'ATTACH_ACCEPT'
            })
        }
    }
}

function createPdpContext(res, message) {

    const APN = message.APN
    const P_TMSI = message.P_TMSI

    for (let i = 0; i < users.length; i++) {
        if (users[i].P_TMSI === P_TMSI) {
            users[i].NSAPI = message.NSAPI
            users[i].LLCSAPI = message.LLCSAPI
            users[i].TEID = users[i].IMSI + message.NSAPI
        }
    }

    const dnsBody = {
        type: 'DNS_QUERY_REQUEST',
        name: APN
    }

    logger(dnsBody)

    request(
        {
            uri: `${DNS_URL}/Gn`,
            method: 'POST',
            body: JSON.stringify(dnsBody),
            headers: {
                'Content-Type': 'application/json'
            }
        },
        (error, response) => {
            if (response?.statusCode === 200) {
                try {
                    const message = JSON.parse(response.body)

                    logger(message)
                    console.log('DNS has been fetched!')
                    console.log('Fetch GGSN...', message.ip)

                    const user = users.filter(user => user.P_TMSI === P_TMSI)[0]

                    const TEID = user.IMSI + user.NSAPI

                    const ip = message.ip + '/Gn'
                    const createPdpContextBody = {
                        type: 'CREATE_PDP_CONTEXT_REQUEST',
                        APN: APN,
                        IMSI: user.IMSI,
                        IMEISV: user.IMEISV,
                        MSISDN: user.MSISDN,
                        RAI: SGSN_DATA.RAI,
                        NSAPI: user.NSAPI,
                        TEID: TEID,
                        TEID_DATA: "",
                        TEID_CONTROL_PLANE: "",
                        SAI: "",
                        GSN_ADDRESS: SGSN_DATA.IP
                    }

                    logger(createPdpContextBody)

                    request(
                        {
                            uri: ip,
                            method: 'POST',
                            body: JSON.stringify(createPdpContextBody),
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        },
                        (error, ggsn_res) => {
                            if (error) {
                                res.status(500).end()
                                console.log(error)
                            }
                            if (ggsn_res?.statusCode === 200) {
                                try {

                                    const message = JSON.parse(ggsn_res.body)

                                    logger(message)    

                                    let LLCSAPI = null

                                    for (let i = 0; i < users.length; i++) {
                                        if (users[i].P_TMSI === user.P_TMSI) {
                                            users[i].END_USER_ADDRESS = message.END_USER_ADDRESS
                                            users[i].GGSN_ADDRESS = message.GSN_ADDRESS
                                            users[i].CHARGIND_ID = message.CHARGIND_ID
                                            LLCSAPI = users[i].LLCSAPI
                                        }
                                    }

                                    const activatePdpRes = {
                                        type: 'ACTIVATE_PDP_CONTEXT_ACCEPT',
                                        PDP_ADDRESS: message.END_USER_ADDRESS,
                                        LLCSAPI
                                    }

                                    logger(activatePdpRes)  

                                    res.status(200).json(activatePdpRes)
                                }
                                catch (err) {
                                    res.status(500).end()
                                }
                            }
                        }

                    )
                }
                catch (err) {
                    console.log(err)
                }
            }
            if (error) {
                console.log(error)
            }
        }
    )
}

function sendDeactivatePDPRequest(res, message) {

    const LLCSAPI = message.LLCSAPI

    let body = {
        type: 'DELETE_PDP_CONTEXT_REQUEST'
    }

    let GSN_IP = ''

    for (let i = 0; i < users.length; i++) {
        if (users[i].LLCSAPI === LLCSAPI) {
            body.NSAPI = users[i].NSAPI
            body.TEID = users[i].TEID
            GSN_IP = users[i].GGSN_ADDRESS
            break
        }
    }

    logger(body)  

    request(
        {
            uri: `${GSN_IP}/Gn`,
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        },
        (error, response) => {
            if (response?.statusCode === 200) {

                const message = JSON.parse(response.body)

                logger(message)  

                const deactPDPAccept = {
                    type: 'DEACTIVATE_PDP_CONTEXT_ACCEPT'
                }

                logger(deactPDPAccept)

                res.status(200).json(deactPDPAccept)

            }
        }
    )

}

function detach(res, message) {

    const P_TMSI = message.P_TMSI
    users = users.filter(user => user.P_TMSI !== P_TMSI)

}

app.post('/Gb', (req, res) => {

    const message = req.body

    switch (message.type) {
        case 'ATTACH_REQUEST': {
            identifyRequest(res, message)
            break
        }
        case 'IDENTIFY_RESPONSE': {
            authenticate(res, message)
            break
        }
        case 'ATTACH_COMPLETED': {
            // createPdpContext(res, message)
            break
        }
        case 'ACTIVATE_PDP_CONTEXT_REQUEST': {
            createPdpContext(res, message)
            break
        }
        case 'DEACTIVATE_PDP_CONTEXT_REQUEST': {
            // createPdpContext(res, message)
            sendDeactivatePDPRequest(res, message)
            break
        }
        case 'DETACH_REQUEST': {
            // createPdpContext(res, message)
            detach(res, message)
            break
        }
        default: {

        }
    }

})

app.post('/Gn', (req, res) => {

    const message = req.body

    switch (message.type) {
        case 'DNS_QUERY_RESPONSE': {
            // identifyRequest(res, message)
            break
        }
        default: {

        }
    }
})

const PORT = 5002
server.listen(PORT, () => {
    console.log('SGSN is working!')
})