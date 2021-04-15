import React from "react";
import { Redirect } from "react-router-dom";
import uuid from "uuid/v4";
import { ColorContext } from "../context/colorcontext";
import ACE from "../chess/assets/ace3.png";
import knight from "../chess/assets/knight.png";
import chessboard from "../chess/assets/chessboard.png";

const socket = require("../services/socket").socket;

/**
 * Onboard is where we create the game room.
 */

class CreateNewGame extends React.Component {
  state = {
    didGameStart: false,
    inputText: "",
    gameId: "",
  };

  constructor(props) {
    super(props);
    this.textArea = React.createRef();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.startGame);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.startGame);
  }

  startGame = (e) => {
    if (e.keyCode == 13) {
      document.getElementById("startGame").click();
      //call text to speech commands here if required, using SpeechHandler.speakThis(text to speak)
    }
  };

  send = () => {
    const newGameRoomId = uuid();

    // set the state of this component with the gameId so that we can
    // redirect the user to that URL later.
    this.setState({
      gameId: newGameRoomId,
    });

    // emit an event to the server to create a new room
    socket.emit("createNewGame", newGameRoomId);
  };

  render() {
    return (
      <React.Fragment>
        {this.state.didGameStart ? (
          <Redirect to={"/game/" + this.state.gameId}>
            <button
              className="btn btn-success"
              style={{
                marginLeft: String(window.innerWidth / 2 - 60) + "px",
                width: "120px",
              }}
            >
              Start Game
            </button>
          </Redirect>
        ) : (
          <>
            <div className="nav-bar">
              <ul className="nav-items">
                <button className="nav-btn">Rules</button>
                <button
                  className="nav-btn"
                  onClick={() =>
                    window.open(
                      "https://github.com/MLH-Fellowship/ACE",
                      "_blank"
                    )
                  }
                >
                  Github
                </button>
                <button className="nav-btn">Credits</button>
              </ul>
            </div>

            <div
              id="onboard"
              // className="onboard"
              style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "purple",
                  backgroundImage: `url(${knight})`,
                  width: "50%",
                  height: "100vh",
                }}
              ></div>

              <div
                style={{
                  width: "50%",
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "70px",
                      fontFamily: "Train One, cursive",
                    }}
                  >
                    ACE
                  </h1>
                  <p
                    style={{
                      margin: " 2px",
                      fontSize: "1.5rem",
                      paddingBottom: "20px",
                    }}
                  >
                    Your accessible chess experience
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <img src={chessboard} height="250px" width="700px"></img>
                </div>
                <div style={{ textAlign: "center" }}>
                  <button
                    id="startGame"
                    className="btn btn-primary"
                    onClick={() => {
                      this.props.didRedirect();
                      this.setState({
                        didGameStart: true,
                      });
                      this.send();
                    }}
                  >
                    <p style={{ fontSize: "18px" }}>Start Game</p>
                  </button>
                </div>
              </div>
              {/* <div
              style={{
                width: "50%",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                style={{ textAlign: "left", fontSize: "18px", padding: "10px" }}
              >
                <h3>Instructions</h3>
                <i class="fas fa-chess-pawn"></i> ACE is a two player voice
                powered accessible chess game for the visually impaired. You can
                press the start button or press enter key to start the game.
                <br />
                <br />
                <i class="fas fa-chess-pawn"></i> You will be redirected to the
                link screen where the game link will automatically be copied on
                your clipboard. You can click on the link or press enter to copy
                it again if required. You can now send this link to a friend and
                start playing.
                <br />
                <br />
                <i class="fas fa-chess-pawn"></i> Once you are on the game
                screen, the player who has created the game is assigned white
                and makes the first move. To make a move, press spacebar and say
                "Move" (or click on move button), the computer will guide you
                through making your move using voice commands.
                <br />
                <br />
                <i class="fas fa-chess-pawn"></i> Every time your opponent makes
                a move, the move will be spoken to you by the computer. If you
                want to repeat it again, press spacebar and say "Repeat" (or
                click on the repeat button) and the computer will reiterate your
                opponents move.
                <br />
                <br />
                <i class="fas fa-chess-pawn"></i> In the event you want a
                summary of the chessboard, you can hit spacebar (or press speak
                positions button) and say "Speak positions", the computer will
                repeat positions of all pieces on the board.
                <br />
                <br />
                <i class="fas fa-chess-pawn"></i> In case you want to know the
                piece at a particular square, hit spacebar (or press find
                button) and say "Find" and the computer will help you find the
                piece on the square you request.
                <br />
                <br />
                <i class="fas fa-chess-pawn"></i> The computer will alert you
                when you make an invalid move, when your king is in check, when
                you or your opponent is checkmated or either players resign.
                <br />
                <br />
                <i class="fas fa-chess-pawn"></i> Finally, you can resign the
                game by hitting spacebar and saying "Resign", the computer will
                ask you for confirmation, and once confirmed the game will end.
                <br />
              </p>
            </div> */}
            </div>
          </>
        )}
      </React.Fragment>
    );
  }
}

const Onboard = (props) => {
  const color = React.useContext(ColorContext);

  return <CreateNewGame didRedirect={color.playerDidRedirect} />;
};

export default Onboard;
