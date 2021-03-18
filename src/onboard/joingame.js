import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
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
            <div className='navbar__item'><a href="/">Exit Game</a></div>  
            <div className='navbar__item'><i class="fab fa-github"></i><a target="_blank" href="https://github.com/MLH-Fellowship/ACE">Visit Github</a></div>
        </header>
    )
}

export default JoinGame
  
