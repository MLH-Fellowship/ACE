import React from 'react'
import { Redirect } from 'react-router-dom'
import uuid from 'uuid/v4'
import { ColorContext } from '../context/colorcontext' 
import ACE from '../chess/assets/ACE.png'

const socket  = require('../services/socket').socket

/**
 * Onboard is where we create the game room.
 */

class CreateNewGame extends React.Component {
    state = {
        didGameStart: false,
        inputText: "",
        gameId: ""
    }

    constructor(props) {
        super(props);
        this.textArea = React.createRef();
    }
    
    send = () => {
        const newGameRoomId = uuid()

        // set the state of this component with the gameId so that we can
        // redirect the user to that URL later. 
        this.setState({
            gameId: newGameRoomId
        })

        // emit an event to the server to create a new room 
        socket.emit('createNewGame', newGameRoomId)
    }

    typingUserName = () => {
        // grab the input text from the field from the DOM 
        const typedText = this.textArea.current.value
        
        // set the state with that text
        this.setState({
            inputText: typedText
        })
    }

    render() {

        return (<React.Fragment>
            {
                this.state.didGameStart ? 
                <Redirect to = {"/game/" + this.state.gameId}><button className="btn btn-success" style = {{marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px"}}>Start Game</button></Redirect>

            :
               <div style={{height:'100vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
                   <div style={{textAlign:'center'}}>
                    <img src={ACE} height="200px" width="200px"></img>
                    </div>
                    <div style={{textAlign:'center'}}>
                        <h3>Instructions</h3>
                        <p style={{marginLeft:'30%',textAlign:'left'}}>
                            1. Non est ad consectetur ut ea commodo id nostrud.
                            <br/>
                            2. Aliqua sint do duis amet ut officia.
                            <br/>
                            3. Aute magna non sint aute do.
                            <br/>
                            4. Duis irure ipsum aute non quis dolor.
                            <br/>
                            5. Voluptate tempor amet dolor pariatur sint dolor exercitation nisi aliqua ex est ut eiusmod.
                            <br/>
                        </p>
                    </div>
                    <div style={{textAlign:'center'}}>
                        <button className="btn btn-primary" 
                            style = {{ width: "120px"}} 
                            onClick = {() => {
                                this.props.didRedirect() 
                                this.setState({
                                    didGameStart: true
                                })
                                this.send()
                            }}>Start Game
                        </button>
                    </div>
                </div>
            }
            </React.Fragment>)
    }
}

const Onboard = (props) => {
    const color = React.useContext(ColorContext)

    return <CreateNewGame didRedirect = {color.playerDidRedirect}/>
}


export default Onboard