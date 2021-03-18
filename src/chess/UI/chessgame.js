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
import Waiting from '../assets/waiting.png'
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
            isPressed: false,
            latestOpponentMove: null
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
                    else if(commandcode[0]==4){
                        this.repeatOpponentMove()
                    }
                    else if(commandcode[0] == 6){
                        this.findChessPiece()
                    }
                    else if(commandcode[0] == 5){
                        this.resignGame()
                    }
                    else if(commandcode[0] == 7){
                        this.checkConfirmation()
                    }
                    else if(commandcode[0]==-1){
                        SpeechHandler.speakThis('I\'m sorry I did not get that, please repeat your command')
                    }
                    else if(commandcode[0]==-2){
                        SpeechHandler.speakThis('I\'m sorry that is not a command, please repeat your command')
                    }
                })
                
            }
      } 
    }

    componentDidMount() {
        // register event listeners
        socket.on('opponent move', move => {
            if (move.playerColorThatJustMovedIsWhite !== this.props.color) {
                console.log("opponents move is: ")
                console.log(move)

                let piece = ""

                if(move.selectedId[1]==='p')
                    piece = 'pawn'
                else if(move.selectedId[1]==='n')
                    piece = 'knight'
                else if(move.selectedId[1]==='b')
                    piece = 'bishop'
                else if(move.selectedId[1]==='r')
                    piece = 'rook'
                else if(move.selectedId[1]==='q')
                    piece = 'queen'
                else if(move.selectedId[1]==='k')
                    piece = 'king'
                
                let final_move = piece + " moved from " + move.from + " to " + move.to
                console.log(final_move)
                this.movePiece(move.selectedId, move.finalPosition, this.state.gameState, false, move.from, move.to)
                this.setState({
                    playerTurnToMoveIsWhite: !move.playerColorThatJustMovedIsWhite,
                    latestOpponentMove: final_move
                })
            }
        })

        socket.on('resign game',playerColor => {
            if(playerColor==this.props.color){
                alert("You resigned the game")
                //Here, take input of new game or rematch and call this.newgame or this.rematch
            }else{
                alert("Opponent resigned the game")
                 //Here, take input of new game or rematch and call this.newgame or this.rematch
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

    movePiece = (selectedId, finalPosition, currentGame, isMyMove, from, to) => {
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
                gameId: this.props.gameId,
                from: from,
                to: to
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
            //new game: back to link paget
            //code implementation in this.props.restar and this.props.newGame
        }
    }

    getActualCoordinates(rank, file){
        if(this.props.color)
        {
            rank = 8 - rank
            rank = rank.toString()
            file = file + 97
            file = String.fromCharCode(file)
        }
        else
        {
            rank = rank + 1
            rank = rank.toString()
            file = 7 - file
            file = file + 97
            file = String.fromCharCode(file)
        }

        return (file+rank)
    }

    getPositionFromId(searchId){
        let rank = 0
        let file = 0

        for(let i=0;i<8;i++)
        {
            for(let j=0;j<8;j++)
            {
                if(this.state.gameState.chessBoard[i][j].pieceOnThisSquare!==null && this.state.gameState.chessBoard[i][j].pieceOnThisSquare.id === searchId){
                    rank = i
                    file = j
                }
            }
        }
        return [rank, file]
    }

    endDragging = (e) => {
        const currentGame = this.state.gameState
        const currentBoard = currentGame.getBoard()
        const finalPosition = this.inferCoord(e.target.x() + 90, e.target.y() + 90, currentBoard)
        const selectedId = this.state.draggedPieceTargetId
        const selectedIdPos = this.getPositionFromId(selectedId)
        const from_pos = this.getActualCoordinates(selectedIdPos[0],selectedIdPos[1])
        const to_pos = this.getActualCoordinates(finalPosition[1],finalPosition[2])
        this.movePiece(selectedId, finalPosition[0], currentGame, true, from_pos, to_pos)
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
        var i_final = 0
        var j_final = 0
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
                    i_final = i
                    j_final = j
                }
            }
        }

        return [hashmap[shortestDistance],i_final,j_final]
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
                position_to_speak = position_to_speak + this.state.gameState.chessBoard[i][j].pieceOnThisSquare.color + ' ' + this.state.gameState.chessBoard[i][j].pieceOnThisSquare.name + "on" + file[j] + rank[i] + '\n'
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
        await SpeechHandler.hearThis((commandcode)=>{
            console.log("Receiving callback in find piece")
            console.log(commandcode);
            if(commandcode[0] == 3){
                sq = commandcode[1]
            }
            else if(commandcode[0] == -1 || commandcode[0] == -2){
                SpeechHandler.speakThis("Did not get that, please repeat the square.")
                this.findChessPiece()
            }
            else if(commandcode[0] == 8){
                SpeechHandler.speakThis("Okay. Cancelling.")
            }
            let cords = this.getBoardCoordinates(sq)
            const currentGame = this.state.gameState
            let end = ""
            console.log("Piece on this square: " + this.state.gameState.chessBoard[cords[0]][cords[1]].pieceOnThisSquare)

            
            if(this.state.gameState.chessBoard[cords[0]][cords[1]].pieceOnThisSquare!==null){
                const selectedId = currentGame.chessBoard[cords[0]][cords[1]].pieceOnThisSquare.color + " " + currentGame.chessBoard[cords[0]][cords[1]].pieceOnThisSquare.name
                //SpeechHandler.speakThis(selectedId)
                end = selectedId
            }
            else
               // SpeechHandler.speakThis("No piece")
               end = "No piece"

            
            SpeechHandler.speakThis(end + "found on " + sq)
            //SpeechHandler.speakThis(sq)
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
        if((this.state.playerTurnToMoveIsWhite == this.props.color) || (!this.state.playerTurnToMoveIsWhite == !this.props.color)){

            let from=""
            let to=""
            SpeechHandler.speakThis("Which Square do you want to move from?")
            
            SpeechHandler.hearThis((commandcode)=>{
                //This is the callback function that gets fired once the recognition stops and recognises the speech
                // Add logic here to perform different tasks
                console.log("receiving callback in make move from")
                console.log(commandcode)
                //example logic:
                if(commandcode[0]==3){
                    from = commandcode[1]
                }
                else{
                    SpeechHandler.speakThis("Sorry, not a valid square. Please try again.")
                    this.makeMoveUsingVoice()
                }

                SpeechHandler.speakThis("Which Square do you want to move to?")

                SpeechHandler.hearThis((commandcode)=>{
                    //This is the callback function that gets fired once the recognition stops and recognises the speech
                    // Add logic here to perform different tasks
                    console.log("receiving callback in make move to")
                    console.log(commandcode);
                    //example logic:
                    if(commandcode[0] != 3){
                        SpeechHandler.speakThis("Sorry, not a valid square. Please try again.")
                        this.makeMoveUsingVoice()
                    }
                    else{
                        to = commandcode[1]
                        SpeechHandler.speakThis("Please say confirm to confirm that you want to move piece from " + from + "to " + to)
                        SpeechHandler.hearThis((commandcode)=>{
                            if(commandcode[0] == 7){
                                let from_coords = this.getBoardCoordinates(from)
                                let to_coords = this.getBoardCoordinates(to)
                                
                                const currentGame = this.state.gameState
                                const currentBoard = currentGame.getBoard()
                                const finalPosition = currentBoard[to_coords[0]][to_coords[1]].getCanvasCoord()
                                const selectedId = currentGame.chessBoard[from_coords[0]][from_coords[1]].pieceOnThisSquare.id
                                this.movePiece(selectedId, finalPosition, currentGame, true, from, to)
                            }
                        })
                    }
                })
            })
        }
        else{
            SpeechHandler.speakThis("Not your move.")
        }
    }
    

    repeatOpponentMove=()=>{
        //computer repeats oponents last move
        //save it as a peice of state if required

        if(this.state.latestOpponentMove===null)
            SpeechHandler.speakThis("no moves have been made yet")
        else
            SpeechHandler.speakThis(this.state.latestOpponentMove)

    }

    resignGame=()=>{
        SpeechHandler.speakThis("Please say Confirm to confirm or stop to cancel resignation")
        SpeechHandler.hearThis((commandcode)=>{
            if(commandcode[0] == 7){
                SpeechHandler.speakThis("You have resigned the game.")
                socket.emit('resign',{gameId:this.props.gameId,playerColor:this.props.color})
            }
            else if(commandcode[0] == 8){
                SpeechHandler.speakThis("Okay, cancelling.")
            }
            else{
                this.resignGame()
            }

        })
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
             <div  className="chessDiv">
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
        </div>
        <div class="interaction-btns">
                <button className="btn btn-primary" onClick={()=>this.speakPositions()}>Speak positions</button>
                <br/>
                <button className="btn btn-primary" onClick={()=>this.findChessPiece("Please speak up a position on board")}>Find</button>
                <br/>
                <button className="btn btn-primary" onClick={()=>this.makeMoveUsingVoice()}>Move</button>
                <br/>
                <button className="btn btn-primary" onClick={()=>this.repeatOpponentMove()}>Repeat oponent move</button>
                <br/>
                <button className="btn btn-primary" onClick={()=>this.resignGame()}>Resign the game</button>
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
    const [gameSessionDoesNotExist, doesntExist] = React.useState(false)

    const initialize= async ()=>{
        await SpeechHandler.initializeTextToSpeech();
    }

    React.useEffect(() => {
        initialize();
        socket.on("playerJoinedRoom", statusUpdate => {
            console.log("A new player has joined the room! , Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
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
        
    
        socket.on('start game', (idData) => {
            console.log("START!")
            didJoinGame(true)
        })
        
        const key = document.querySelector('.key')
        const keyText = key.innerText
        const copy = document.querySelector('.copy')
        const copied = document.querySelector('.copied')


        // Show "copy" icon on hover with helper class.
        key.addEventListener('mouseover', () => copy.classList.remove('hide'))
        key.addEventListener('mouseleave', () => copy.classList.add('hide'))


        // Copy text when clicking on it.
        key.addEventListener('click', () => {
            // We change "copy" icon for "copied" message.
            copy.classList.add('hide')
            copied.classList.remove('hide')
            
            // We turn simple text into an input value temporarily, so we can use methods .select() and .execCommand() which are compatible with inputs and textareas.
            let helperInput = document.createElement('input')
            document.body.appendChild(helperInput)
            helperInput.value = keyText
            helperInput.select()
            document.execCommand('copy')
            document.body.removeChild(helperInput)
            SpeechHandler.speakThis("Game code has been copied on your clipboard! Press enter if you want to copy it again")
            
            // We remove the "copied" message after 2 seconds.
            setTimeout( () => {
                copied.classList.add('hide')
            }, 2000)
            
        })
        document.addEventListener("keydown", copyCode);
        key.click();
       

    
        
    }, [])

    const copyCode = (e) =>{
        if(e.keyCode == 13){
            const key = document.querySelector('.key')
            key.click()
        }
    }


    return (
      <React.Fragment>
        {opponentDidJoinTheGame ? (
          <div className="outer">
          <div >
           
            <div style={{ display: "flex" , justifyContent: "space-evenly"}}>
                <div className="classification" style={{ display: "flex" , justifyContent: "space-between", flexDirection:"column",height:"80vh"}}>
                 <h4> Opponent  </h4>
                  <h4> You  </h4>
                </div>
              <ChessGame
                playAudio={play}
                gameId={gameid}
                color={color.didRedirect}
              />
            </div>
            </div>
          </div>
        ) : gameSessionDoesNotExist ? (
          <div>
            <h1 style={{ textAlign: "center", marginTop: "200px" }}> :( </h1>
          </div>
        ) : (
          <div className="inviteScreen" id="invite">
            <div style={{height:"10vh"}}></div>
            <h1
              style={{
                textAlign: "center",
                marginBottom:"40px"
              }}
            >
              Hey, copy and paste the URL
              below to send to your friend:
            </h1>
            <p class="small" style={{textAlign:"center"}}>(Click on text to copy it)</p>
                <p style={{textAlign:"center", marginLeft:"85px"}}>
                    <strong>Room Code: </strong>
                    <span class="key">{domainName + "/game/" + gameid}</span>
                    <i class="copy hide far fa-copy"></i>
                    <span class="copied hide">
                        <i class="fas fa-check"></i> <small>Copied!</small>
                    </span>
                </p>
              <br/>
              <div style={{textAlign:"center"}}>
            <img src={Waiting} height="200px" width="200px"/>
            </div>
            <h1 style={{ textAlign: "center", marginTop: "10px" }}>
              {" "}
              Waiting for other opponent to join the game...{" "}
            </h1>
          </div>
        )}
      </React.Fragment>
    );
};

export default ChessGameWrapper
