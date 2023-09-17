const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())

function defineGGSN(APN) {

    const table = {
        '58882': 'http://localhost:5014',
        'internet.tele2.ru': 'http://localhost:5013',
        'internet.tele2.ru.gprs': 'http://localhost:5003',

    }

    return table[APN]
}

function defineName(name) {

    const table = {
        '58882': 'http://localhost:5014',
        'internet.tele2.ru': 'http://localhost:5013',
        'internet.tele2.ru.gprs': 'http://localhost:5003',
    }

    return table[name]

}

app.post('/Gn', (req, res) => {

    const message = req.body

    const name = message.name

    const ip = defineName(name)

    res.status(200).json({
        ip: ip
    })

})

const PORT = 5050
server.listen(PORT, () => {
    console.log('DNS is working!')
})