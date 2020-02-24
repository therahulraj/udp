const net = require("net")

// let port = process.env.PORT || 8080;
// var address = server.address();
const server = net.createServer(socket => {
    socket.write("hello")
    socket.on("data", data => {
        console.log(data.toString())
    })
    setInterval(() => {
        socket.write("rahul raj")
    }, 1000)
})

// server.listen(8080)
server.listen(function(){
    var address = server.address();
    var port = address.port;
    var family = address.family;
    var ipaddr = address.address;
    console.log('Server is listening at port' + port);
    console.log('Server ip :' + ipaddr);
    console.log('Server is IP4/IP6 : ' + family);
  });

// const dgram = require("dgram")
// const socket = dgram.createSocket('udp4')

// socket.on('message', (msg, rinfo) => {
//     console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`)
// })

// socket.bind(8081);