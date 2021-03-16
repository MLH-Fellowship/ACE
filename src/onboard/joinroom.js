import React from 'react'
import JoinGame from './joingame'
import ChessGame from '../chess/UI/chessgame'
import ACE from '../chess/assets/ACE.png'

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

    typingUserName = () => {
        // grab the input text from the field from the DOM 
        const typedText = this.textArea.current.value
        
        // set the state with that text
        this.setState({
            inputText: typedText
        })
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