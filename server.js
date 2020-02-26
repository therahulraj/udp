const net = require("net")


let port = 8080;
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

server.listen(port)
// server.listen(function(){
//     var address = server.address();
//     var port = address.port;
//     var family = address.family;
//     var ipaddr = address.address;
//     console.log('Server is listening at port' + port);
//     console.log('Server ip :' + ipaddr);
//     console.log('Server is IP4/IP6 : ' + family);
//   });





//************************************* this is for udp connection*******************************************************

// const dgram = require("dgram");
// const socket = dgram.createSocket('udp4');
// const message = Buffer.from('Some bytes');


// var data1 = Buffer.from('hello');
// var data2 = Buffer.from('world');





// socket.on('message',function(msg, info) {
//     console.log('Data received from client : ' + msg.toString());
//     console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
  
//   //sending msg

//     socket.send(msg, info.port, info.address, function(error){
//       if(error){
//         client.close();
//       }else{
//         console.log('Data sent !!!');
//       }
    
//     });
//   });



// socket.bind(8081);
//******************************************************************************
