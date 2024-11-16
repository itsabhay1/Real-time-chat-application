import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";

const app = express()

const server = createServer(app)
const io = new Server(server,{
    cors:{
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
})

io.on("connection",(socket)=>{
    console.log("user connected");
    
    console.log("ID", socket.id)
    socket.emit("welcome", `welcome to server,${socket.id}`)
})

io.on("disconnect",()=> {
    console.log("disconnect user", socket.id)
})

export{
    app,
    server
}