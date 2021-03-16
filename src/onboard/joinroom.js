import React from 'react'
import JoinGame from './joingame'
import ChessGame from '../chess/UI/chessgame'

/**
 * Onboard is where we create the game room.
 */

class JoinRoom extends React.Component {
    state = {
        didGetUserName: false,
        inputText: ""
    }

    constructor(props) {
        super(props);
        this.textArea = React.createRef();
    }

    render() {
    
        return (
            <React.Fragment>
                    <JoinGame isCreator = {false}/>
                    <ChessGame />
                </React.Fragment>
        )
    }
}

export default JoinRoom