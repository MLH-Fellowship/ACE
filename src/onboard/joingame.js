import React from 'react'
import { useParams } from 'react-router-dom'
const socket  = require('../services/socket').socket

/**
 * 'Join game' is where we actually join the game room. 
 */


const JoinGameRoom = (gameid, isCreator) => {
    const idData = {
        gameId : gameid,
        isCreator: isCreator
    }
    socket.emit("playerJoinGame", idData)
}
  
  
const JoinGame = (props) => {
    const { gameid } = useParams()
    JoinGameRoom(gameid, props.isCreator)
    return <div>
        <h1 style = {{textAlign: "center"}}>Welcome to ACE!</h1>
        <h3 style = {{textAlign: "center"}}>Your accesible chess experience</h3>
    </div>
}

export default JoinGame
  
