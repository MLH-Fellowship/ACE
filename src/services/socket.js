import io from 'socket.io-client'

const URL = 'http://localhost:8000/' 

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