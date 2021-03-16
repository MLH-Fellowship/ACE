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
        didGetUserName: false,
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
                this.state.didGetUserName ? 
                <Redirect to = {"/game/" + this.state.gameId}><button className="btn btn-success" style = {{marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px"}}>Start Game</button></Redirect>

            :
               <div>
                    <img src={ACE} height="200px" width="200px"></img>
                    <button className="btn btn-primary" 
                        style = {{marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px", marginTop: "62px"}} 
                        onClick = {() => {
                            this.props.didRedirect() 
                            // this.props.setUserName(this.state.inputText) 
                            this.setState({
                                didGetUserName: true
                            })
                            this.send()
                        }}>Submit</button>
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