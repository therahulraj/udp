const net = require("net")

let port = process.env.PORT || 8080;
const server = net.createServer(socket => {
    socket.write("hello")
    socket.on("data", data => {
        console.log(data.toString())
    })
    setInterval(() => {
        socket.write("rahul raj")
    }, 1000)
})

server.listen(port)

// const dgram = require("dgram")
// const socket = dgram.createSocket('udp4')

// socket.on('message', (msg, rinfo) => {
//     console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`)
// })

// socket.bind(8081);