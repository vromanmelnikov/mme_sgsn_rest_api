const request = require("request")

const MME_URL = 'http://localhost:5012/S1'

function mmeService(socket) {

    return({

        sendMessage: (message) => {
            request(
                {
                    uri: MME_URL,
                    body: JSON.stringify(message),
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                (error, responce) => {
                    if (error) {
                        socket.close()
                    }
                    if (responce?.statusCode === 200) {
                        try {
                            const message = responce.body
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

module.exports = mmeService