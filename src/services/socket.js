import io from 'socket.io-client'
import {SERVER_URL} from './config'

const URL = SERVER_URL 

const socket = io(URL)

var mySocketId

socket.on("createNewGame", statusUpdate => {
    console.log("A new game has been created! , Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
    mySocketId = statusUpdate.mySocketId
})

export {
    socket,
    mySocketId
}