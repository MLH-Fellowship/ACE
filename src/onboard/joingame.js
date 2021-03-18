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
    return(
        <header className='navbar'>
            <div className='navbar__title navbar__item'>ACE</div>
            <div className='navbar__item'>Exit Game</div>  
            <div className='navbar__item'><i class="fab fa-github"></i> Visit Github</div>     
        </header>
    )
}

export default JoinGame
  
