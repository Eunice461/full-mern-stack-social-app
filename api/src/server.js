const http = require('http');

const io = require('socket.io')

const socket = require('./sockets')

const schedule = require('./middleware/schedule')

require('dotenv').config()

const appServer = require('./app')

const { mongoConnect } = require('./services/mongo')

const PORT =process.env.PORT || 5000;

const httpServer = http.createServer(appServer)
const socketSever = io(httpServer,{
    cors: {
        origin: "http://localhost:3000",
        //credentials: true,
      },
}
    )

async function startServer(){
    await mongoConnect()

    httpServer.listen(PORT, () => {
			console.log(`Server is Listening on Port ${PORT}`);
		}); 
}
startServer();
socket.listen(socketSever)


