import React from 'react'
import Game from '../model/chess'
import Square from '../model/square'
import { Stage, Layer } from 'react-konva';
import Board from '../assets/chessBoard.png'
import Piece from './piece'
import piecemap from './piecemap'
import useSound from 'use-sound'
import chessMove from '../assets/moveSoundEffect.mp3'
import { useParams } from 'react-router-dom'
import { ColorContext } from '../../context/colorcontext' 
import SpeechHandler from '../../services/speech';
const socket  = require('../../services/socket').socket


class ChessGame extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {
            gameState: new Game(this.props.color),
            draggedPieceTargetId: "", // empty string means no piece is being dragged
            playerTurnToMoveIsWhite: true,
            whiteKingInCheck: false, 
            blackKingInCheck: false,
            isPressed:false
        }
        this.speakPositions = this.speakPositions.bind(this)
    }

    handleKeyUp = (e) =>{
        if(e.keyCode == 32){
            this.setState({
                isPressed:false
            })
            SpeechHandler.stopHearing()
            //call text to speech commands here if required, using SpeechHandler.speakThis(text to speak)
        }
    }

    handleKeyDown = (e) => {
        if (!this.state.isPressed) {  
            if(e.keyCode == 32){
                this.setState({
                    isPressed:true
                })
                SpeechHandler.hearThis((commandcode)=>{
                    //This is the callback function that gets fired once the recognition stops and recognises the speech
                    // Add logic here to perform different tasks
                    console.log("receiving callback")
                    console.log(commandcode);
                    //example logic:
                    if(commandcode[0]==1){
                        this.speakPositions()
                    }
                    else if(commandcode[0]==2){
                        this.makeMoveUsingVoice()
                    }
                    else if(commandcode[0] == 4){
                        this.findChessPiece()
                    }
                })
                
            }
      } 
    }

    componentDidMount() {
        // register event listeners
        socket.on('opponent move', move => {
            if (move.playerColorThatJustMovedIsWhite !== this.props.color) {
                this.movePiece(move.selectedId, move.finalPosition, this.state.gameState, false)
                this.setState({
                    playerTurnToMoveIsWhite: !move.playerColorThatJustMovedIsWhite
                })
            }
        })
        //this.speakPositions()
        this.initialize()

        //adding listeners for speech start and end
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);

    }

    startDragging = (e) => {
        this.setState({
            draggedPieceTargetId: e.target.attrs.id
        })
    }

    movePiece = (selectedId, finalPosition, currentGame, isMyMove) => {
        /**
         * "update" is the connection between the model and the UI. 
         * This could also be an HTTP request and the "update" could be the server response.
         * (model is hosted on the server instead of the browser)
         */
        console.log("movepiece id:",selectedId)
        console.log("movepiece final pos:",finalPosition)
        console.log("movepiece currentgame:",currentGame)
        var whiteKingInCheck = false 
        var blackKingInCheck = false
        var blackCheckmated = false 
        var whiteCheckmated = false
        const update = currentGame.movePiece(selectedId, finalPosition, isMyMove)
        
        if (update === "moved in the same position.") {
            this.revertToPreviousState(selectedId) // pass in selected ID to identify the piece that messed up
            return
        } else if (update === "user tried to capture their own piece") {
            this.revertToPreviousState(selectedId) 
            return
        } else if (update === "b is in check" || update === "w is in check") { 
            // change the fill of the enemy king or your king based on which side is in check. 
            // play a sound or something
            if (update[0] === "b") {
                blackKingInCheck = true
            } else {
                whiteKingInCheck = true
            }
        } else if (update === "b has been checkmated" || update === "w has been checkmated") { 
            if (update[0] === "b") {
                blackCheckmated = true
            } else {
                whiteCheckmated = true
            }
        } else if (update === "invalid move") {
            this.revertToPreviousState(selectedId) 
            return
        } 


        if (isMyMove) {
            socket.emit('new move', {
                nextPlayerColorToMove: !this.state.gameState.thisPlayersColorIsWhite,
                playerColorThatJustMovedIsWhite: this.state.gameState.thisPlayersColorIsWhite,
                selectedId: selectedId, 
                finalPosition: finalPosition,
                gameId: this.props.gameId
            })
        }
        else
        {
            console.log("received move from opponent")
        }

        this.props.playAudio()
                
        // sets the new game state. 
        this.setState({
            draggedPieceTargetId: "",
            gameState: currentGame,
            playerTurnToMoveIsWhite: !this.props.color,
            whiteKingInCheck: whiteKingInCheck,
            blackKingInCheck: blackKingInCheck
        })

        if (blackCheckmated) {
            alert("WHITE WON BY CHECKMATE!")
            //TODO: option to rematch- same url new game
            //new game: back to link page
            //code implementation in this.props.restart and this.props.newGame
        } else if (whiteCheckmated) {
            alert("BLACK WON BY CHECKMATE!")
            //TODO: option to rematch- same url new game
            //new game: back to link page
            //code implementation in this.props.restart and this.props.newGame
        }
    }

    endDragging = (e) => {
        const currentGame = this.state.gameState
        const currentBoard = currentGame.getBoard()
        const finalPosition = this.inferCoord(e.target.x() + 90, e.target.y() + 90, currentBoard)
        const selectedId = this.state.draggedPieceTargetId
        this.movePiece(selectedId, finalPosition, currentGame, true)
    }

    revertToPreviousState = (selectedId) => {
        /**
         * Should update the UI to what the board looked like before. 
         */
        const oldGS = this.state.gameState
        const oldBoard = oldGS.getBoard()
        const tmpGS = new Game(true)
        const tmpBoard = []

        for (var i = 0; i < 8; i++) {
            tmpBoard.push([])
            for (var j = 0; j < 8; j++) {
                if (oldBoard[i][j].getPieceIdOnThisSquare() === selectedId) {
                    tmpBoard[i].push(new Square(j, i, null, oldBoard[i][j].canvasCoord))
                } else {
                    tmpBoard[i].push(oldBoard[i][j])
                }
            }
        }

        // temporarily remove the piece that was just moved
        tmpGS.setBoard(tmpBoard)

        this.setState({
            gameState: tmpGS,
            draggedPieceTargetId: "",
        })

        this.setState({
            gameState: oldGS,
        })
    }

 
    inferCoord = (x, y, chessBoard) => {
        // console.log("actual mouse coordinates: " + x + ", " + y)
        /*
            Should give the closest estimate for new position. 
        */
        var hashmap = {}
        var shortestDistance = Infinity
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                const canvasCoord = chessBoard[i][j].getCanvasCoord()
                // calculate distance
                const delta_x = canvasCoord[0] - x 
                const delta_y = canvasCoord[1] - y
                const newDistance = Math.sqrt(delta_x**2 + delta_y**2)
                hashmap[newDistance] = canvasCoord
                if (newDistance < shortestDistance) {
                    shortestDistance = newDistance
                }
            }
        }

        return hashmap[shortestDistance]
    }


    initialize=async ()=>{
        await SpeechHandler.initializeSpeechToText()
        await SpeechHandler.initializeTextToSpeech()
    }

    speakPositions(){
        //commputer speakes summary of board
        let rank = []
        let file = []
        
        if (this.props.color){
            rank = ['8','7','6','5','4','3','2','1']
            file = ['A','B','C','D','E','F','G','H']
        }
        else
        {
            rank = ['1','2','3','4','5','6','7','8']
            file = ['H','G','F','E','D','C','B','A']
        }

        let position_to_speak = ""

        for(let i=0; i<8; i++)
        {
            for(let j=0; j<8; j++)
            {
                if(!(this.state.gameState.chessBoard[i][j].pieceOnThisSquare === null))
                position_to_speak = position_to_speak + file[j] + rank[i] + ' ' + this.state.gameState.chessBoard[i][j].pieceOnThisSquare.color + ' ' + this.state.gameState.chessBoard[i][j].pieceOnThisSquare.name + '\n'
            }
        }

        SpeechHandler.speakThis(position_to_speak)
        console.log("trigger speak position")
        console.log(position_to_speak)
    }

    findChessPiece= async ()=> {
        //computer speaks piece at the given square
        //handle the case where button is clicked directly instead of speeh command

        // Define sq
        let sq = ""
        // Ask user for square
        SpeechHandler.speakThis("Which square would you like to check?")
        SpeechHandler.hearThis((commandcode)=>{
            console.log("Receiving callback in find piece")
            console.log(commandcode);
            if(commandcode[0] == 3){
                sq = commandcode[1]
            }
            let cords = this.getBoardCoordinates(sq)
            const currentGame = this.state.gameState
            const currentBoard = currentGame.getBoard()
            //const pos = currentBoard[cords[0]][cords[1]].getCanvasCoord()
            const selectedId = currentGame.chessBoard[cords[0]][cords[1]].pieceOnThisSquare.color + " " + currentGame.chessBoard[cords[0]][cords[1]].pieceOnThisSquare.name
            SpeechHandler.speakThis(selectedId)
        })

    }

    getBoardCoordinates(square){
        let file = square.charCodeAt(0) - 97
        let rank = square.charCodeAt(1) - 49

        if(this.props.color)
            rank = 7 - rank
        else
            file = 7 - file

        console.log(rank,' ', file)
        return [rank, file]
    }

    makeMoveUsingVoice=async ()=>{
        //make move command implementation, pass arguments to function if required
        //peice should move on board
        //handle the case where button is clicked directly instead of speeh command
        let from=""
        let to=""

        SpeechHandler.speakThis("Which Square do you want to move from?")
        
        SpeechHandler.hearThis((commandcode)=>{
            //This is the callback function that gets fired once the recognition stops and recognises the speech
            // Add logic here to perform different tasks
            console.log("receiving callback in make move from")
            console.log(commandcode);
            //example logic:
            if(commandcode[0]==3){
                from = commandcode[1]
            }

            SpeechHandler.speakThis("Which Square do you want to move to?")

            SpeechHandler.hearThis((commandcode)=>{
                //This is the callback function that gets fired once the recognition stops and recognises the speech
                // Add logic here to perform different tasks
                console.log("receiving callback in make move to")
                console.log(commandcode);
                //example logic:
                if(commandcode[0]==3){
                    to = commandcode[1]
                }

                let from_coords = this.getBoardCoordinates(from)
                let to_coords = this.getBoardCoordinates(to)
                
                const currentGame = this.state.gameState
                const currentBoard = currentGame.getBoard()
                const finalPosition = currentBoard[to_coords[0]][to_coords[1]].getCanvasCoord()
                const selectedId = currentGame.chessBoard[from_coords[0]][from_coords[1]].pieceOnThisSquare.id
                //this.movePiece(selectedId, finalPosition, currentGame, true)

            })

        })       
    }

    reapeatOpponentMove=()=>{
        //computer repeats oponents last move
        //save it as a peice of state if required
    }

    resignGame=()=>{
        //computer resigns the game and pops up for restart/new game
    }

    restart=()=>{
        //board should be refreshed
    }

    newGame=()=>{
        //back to link screen with new link generated using uuid
    }
   
    render() {
        /*
            Look at the current game state in the model and populate the UI accordingly
        */
         return (
        <React.Fragment>
        <div style = {{
            backgroundImage: `url(${Board})`,
            width: "720px",
            height: "720px"}}
        >
            <Stage width = {720} height = {720}>
                <Layer>
                {this.state.gameState.getBoard().map((row) => {
                        return (<React.Fragment>
                                {row.map((square) => {
                                    if (square.isOccupied()) {                                    
                                        return (
                                            <Piece 
                                                x = {square.getCanvasCoord()[0]}
                                                y = {square.getCanvasCoord()[1]} 
                                                imgurls = {piecemap[square.getPiece().name]}
                                                isWhite = {square.getPiece().color === "white"}
                                                draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                onDragStart = {this.startDragging}
                                                onDragEnd = {this.endDragging}
                                                id = {square.getPieceIdOnThisSquare()}
                                                thisPlayersColorIsWhite = {this.props.color}
                                                playerTurnToMoveIsWhite = {this.state.playerTurnToMoveIsWhite}
                                                whiteKingInCheck = {this.state.whiteKingInCheck}
                                                blackKingInCheck = {this.state.blackKingInCheck}
                                                />)
                                    }
                                    return
                                })}
                            </React.Fragment>)
                    })}
                </Layer>
            </Stage>
        </div>
        <div class="interaction-btns">
                <button onClick={()=>this.speakPositions()}>Speak positions</button>
                <br/>
                <button onClick={()=>this.findChessPiece("Please speak up a position on board")}>Find</button>
                <br/>
                <button onClick={()=>this.makeMoveUsingVoice()}>Move</button>
                <br/>
                <button onClick={()=>this.reapeatOpponentMove()}>Repeat oponent move</button>
                <br/>
                <button onClick={()=>this.resignGame()}>Resign the game</button>
                <br/>
            </div>
        </React.Fragment>)
    }
}


const ChessGameWrapper = (props) => {
    // get the gameId from the URL here and pass it to the chessGame component as a prop. 
    const domainName = 'http://localhost:3000'
    const color = React.useContext(ColorContext)
    const { gameid } = useParams()
    const [play] = useSound(chessMove);
    const [opponentSocketId, setOpponentSocketId] = React.useState('')
    const [opponentDidJoinTheGame, didJoinGame] = React.useState(false)
    const [opponentUserName, setUserName] = React.useState('')
    const [gameSessionDoesNotExist, doesntExist] = React.useState(false)

    React.useEffect(() => {
        socket.on("playerJoinedRoom", statusUpdate => {
            console.log("A new player has joined the room! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
            if (socket.id !== statusUpdate.mySocketId) {
                setOpponentSocketId(statusUpdate.mySocketId)
            }
        })
    
        socket.on("status", statusUpdate => {
            console.log(statusUpdate)
            alert(statusUpdate)
            if (statusUpdate === 'This game session does not exist.' || statusUpdate === 'There are already 2 people playing in this room.') {
                doesntExist(true)
            }
        })
        
    
        socket.on('start game', (opponentUserName) => {
            console.log("START!")
            if (opponentUserName !== props.myUserName) {
                setUserName(opponentUserName)
                didJoinGame(true) 
            } else {
                socket.emit('request username', gameid)
            }
        })
    
    
        socket.on('give userName', (socketId) => {
            if (socket.id !== socketId) {
                console.log("give userName stage: " + props.myUserName)
                socket.emit('recieved userName', {userName: props.myUserName, gameId: gameid})
            }
        })
    
        socket.on('get Opponent UserName', (data) => {
            if (socket.id !== data.socketId) {
                setUserName(data.userName)
                console.log('data.socketId: data.socketId')
                setOpponentSocketId(data.socketId)
                didJoinGame(true) 
            }
        })

        // initialize()
        // let isPressed = false; 
            
        // document.body.onkeydown = async function (e) { 
        //     if (!isPressed) {  
        //         if(e.keyCode == 32){
        //             isPressed = true;
        //             SpeechHandler.hearThis((commandcode)=>{
        //                 //This is the callback function that gets fired once the recognition stops and recognises the speech
        //                 // Add logic here to perform different tasks
        //                 console.log("receiving callback")
        //                 console.log(commandcode);
                        
        //                 //example logic:
        //                 // if(commandcode==1){
        //                 //     speakPositions()
        //                 // }
        //             })
                    
        //         }
        //     } 
        // };
        
        // document.body.onkeyup = function (e) {  
        //     if(e.keyCode == 32){
        //         isPressed = false;
        //         SpeechHandler.stopHearing()
        //         //call text to speech commands here if required, using SpeechHandler.speakThis(text to speak)
        //     }
        // } 
    }, [])

    // const initialize=async ()=>{
    //     await SpeechHandler.initializeSpeechToText()
    // }

    return (
      <React.Fragment>
        {opponentDidJoinTheGame ? (
          <div>
            <h4> Opponent: {opponentUserName} </h4>
            <div style={{ display: "flex" }}>
              <ChessGame
                playAudio={play}
                gameId={gameid}
                color={color.didRedirect}
              />
            </div>
            <h4> You: {props.myUserName} </h4>
          </div>
        ) : gameSessionDoesNotExist ? (
          <div>
            <h1 style={{ textAlign: "center", marginTop: "200px" }}> :( </h1>
          </div>
        ) : (
          <div>
            <h1
              style={{
                textAlign: "center",
                marginTop: String(window.innerHeight / 8) + "px",
              }}
            >
              Hey <strong>{props.myUserName}</strong>, copy and paste the URL
              below to send to your friend:
            </h1>
            <textarea
              style={{ marginLeft: String((window.innerWidth / 2) - 290) + "px", marginTop: "30" + "px", width: "580px", height: "30px"}}
              onFocus={(event) => {
                  console.log('sd')
                  event.target.select()
              }}
              value = {domainName + "/game/" + gameid}
              type = "text">
              </textarea>
            <br></br>

            <h1 style={{ textAlign: "center", marginTop: "100px" }}>
              {" "}
              Waiting for other opponent to join the game...{" "}
            </h1>
          </div>
        )}
      </React.Fragment>
    );
};

export default ChessGameWrapper
