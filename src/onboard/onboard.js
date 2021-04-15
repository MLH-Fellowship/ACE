import React from "react";
import { Redirect } from "react-router-dom";
import uuid from "uuid/v4";
import { ColorContext } from "../context/colorcontext";
import { Rules } from "../chess/UI/rules";
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
    showRules: false,
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

  setOpenRules = () => {
    this.setState({ showRules: false });
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
                <button
                  className="nav-btn"
                  onClick={() => {
                    this.setState({ showRules: true });
                  }}
                >
                  Rules
                </button>
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
            </div>
            <Rules
              showRules={this.state.showRules}
              setOpenRules={this.setOpenRules}
            />
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
