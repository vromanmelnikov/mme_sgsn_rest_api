const request = require('request')

const SGSN_URL = 'http://localhost:5002/Gb'

function sgsnService(socket, message) {

    return ({

        sendMessageToSGSN: () => {
            request(
                {
                    uri: `${SGSN_URL}`,
                    body: JSON.stringify(message),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                (error, responce) => {
                    if (error) {
                        // console.log(error)
                        socket.close()
                    }
                    if (responce?.statusCode === 200) {
                        try {
                            const message = responce.body
                            // console.log(message)
                            socket.send(message) 
                        }
                        catch (err) {
                        }
                    }
                }
            )
        },
        detachRequest: () => {
            request(
                {
                    uri: `${SGSN_URL}`,
                    body: JSON.stringify(message),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                (error, responce) => {
                    if (error) {
                        // console.log(error)
                        socket.close()
                    }
                    if (responce?.statusCode === 200) {
                        try {
                            const message = responce.body
                            // console.log(message)
                            socket.send(message) 
                        }
                        catch (err) {
                        }
                    }
                }
            )
        }
    })

}

module.exports = sgsnService