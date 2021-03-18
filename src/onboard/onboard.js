import React from 'react'
import { Redirect } from 'react-router-dom'
import uuid from 'uuid/v4'
import { ColorContext } from '../context/colorcontext' 
import ACE from '../chess/assets/ace3.png'


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

    componentDidMount(){
        document.addEventListener("keydown", this.startGame);
    }

    componentWillUnmount(){
        document.removeEventListener("keydown", this.startGame);
    }
    
    startGame = (e) =>{
        if(e.keyCode == 13){
            document.getElementById("startGame").click()
            //call text to speech commands here if required, using SpeechHandler.speakThis(text to speak)
        }
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

    render() {

        return (<React.Fragment>
            {
                this.state.didGameStart ? 
                <Redirect to = {"/game/" + this.state.gameId}><button className="btn btn-success" style = {{marginLeft: String((window.innerWidth / 2) - 60) + "px", width: "120px"}}>Start Game</button></Redirect>

            :
            <div id="onboard" className="onboard" style={{height:'100vh',display:'flex',justifyContent:'center'}}>
            <div style={{width:"50%",height:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',fontSize:'22px'}}>
                <div style={{textAlign:'center'}}>
                <h1 style={{margin:0}}>ACE</h1>
                <p style={{margin:0}}>Your accessible chess experience</p>
                </div>
                <div style={{textAlign:'center'}}>
                    <img src={ACE} height="300px" width="300px"></img>
                    </div>
                        <div style={{textAlign:'center'}}>
                            <button id="startGame" className="btn btn-primary"  
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
                    <div style={{width:"50%",height:'100vh',display:'flex',flexDirection:'column',justifyContent:'center'}}>
                        
                        <p style={{textAlign:'left',fontSize:'22px',padding:'10px'}}>
                            <h3>Instructions</h3>
                            <i class="fas fa-chess-pawn"></i> Non est ad consectetur ut ea commodo id nostrud.
                            <br/>
                            <i class="fas fa-chess-pawn"></i> Aliqua sint do duis amet ut officia.
                            <br/>
                            <i class="fas fa-chess-pawn"></i> Aute magna non sint aute do.
                            <br/>
                            <i class="fas fa-chess-pawn"></i> Duis irure ipsum aute non quis dolor.
                            <br/>
                            <i class="fas fa-chess-pawn"></i> Voluptate tempor amet dolor pariatur sint dolor exercitation nisi aliqua ex est ut eiusmod.
                            <br/>
                        </p>
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