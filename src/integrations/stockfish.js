import React, { Component } from "react";
import PropTypes from "prop-types";
import Chess from "chess.js"; // import Chess from  "chess.js"(default) if recieving an error about new Chess not being a constructor
const STOCKFISH = window.STOCKFISH;
const game = new Chess();

class Stockfish extends Component {
  static propTypes = { children: PropTypes.func };

  state = { fen: "start" };

  componentDidMount() {
      console.log("inside component did mount")
    this.setState({ fen: game.fen() });

    this.engineGame().prepareMove();
  }

  onDrop = async ({ sourceSquare, targetSquare }) => {
    // see if the move is legal
    console.log("hiii")
    console.log(sourceSquare,targetSquare)
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    });
    //console.log(game.move)
    // illegal move
    if (move === null) return;
    var synth = await window.speechSynthesis;
    var toSpeak = await new SpeechSynthesisUtterance(`moving ${sourceSquare} to ${targetSquare}`);
    var voices = await synth.getVoices();
    console.log(voices)
    // console.log(voices)
    toSpeak.voice=voices[0]
    // var selectedVoiceName = voices[0].name;
    // voices.forEach((voice)=>{
    //     if(voice.name === selectedVoiceName){
    //         toSpeak.voice = voice;
    //     }
    // });
    synth.speak(toSpeak);
    // voices = synth.getVoices();
    // var selectedIndex = voiceList.selectedIndex < 0 ? 0 : voiceList.selectedIndex;
    // voiceList.innerHTML = '';
    // voices.forEach((voice)=>{
    //     var listItem = document.createElement('option');
    //     listItem.textContent = voice.name;
    //     listItem.setAttribute('data-lang', voice.lang);
    //     listItem.setAttribute('data-name', voice.name);
    //     voiceList.appendChild(listItem);
    // });

    //voiceList.selectedIndex = selectedIndex;

    return new Promise(resolve => {
      this.setState({ fen: game.fen() });
      resolve();
    }).then(() => this.engineGame().prepareMove());
  };

  engineGame = options => {
    console.log("inside engine game")
    options = options || {};

    /// We can load Stockfish via Web Workers or via STOCKFISH() if loaded from a <script> tag.
    let engine =
      typeof STOCKFISH === "function"
        ? STOCKFISH()
        : new Worker(options.stockfishjs || "stockfish.js");
    let evaler =
      typeof STOCKFISH === "function"
        ? STOCKFISH()
        : new Worker(options.stockfishjs || "stockfish.js");
    let engineStatus = {};
    let time = { wtime: 3000, btime: 3000, winc: 1500, binc: 1500 };
    let playerColor = "black";
    let clockTimeoutID = null;
    // let isEngineRunning = false;
    let announced_game_over;
    // do not pick up pieces if the game is over
    // only pick up pieces for White

    setInterval(function() {
        //console.log("checking for game over inside set interval")
      if (announced_game_over) {
        return;
      }

      if (game.game_over()) {
        announced_game_over = true;
      }
    }, 500);

    function uciCmd(cmd, which) {
      console.log('inside UCI cmd func: ' + cmd);

      (which || engine).postMessage(cmd);
    }
    uciCmd("uci");

    // function clockTick() {
    //     console.log("inside clock tick")
    //   let t =
    //     (time.clockColor === "white" ? time.wtime : time.btime) +
    //     time.startTime -
    //     Date.now();
    //   let timeToNextSecond = (t % 1000) + 1;
    //   clockTimeoutID = setTimeout(clockTick, timeToNextSecond);
    // }

    // function stopClock() {
    //     console.log("inside stop clock")
    //   if (clockTimeoutID !== null) {
    //     clearTimeout(clockTimeoutID);
    //     clockTimeoutID = null;
    //   }
    //   if (time.startTime > 0) {
    //     let elapsed = Date.now() - time.startTime;
    //     time.startTime = null;
    //     if (time.clockColor === "white") {
    //       time.wtime = Math.max(0, time.wtime - elapsed);
    //     } else {
    //       time.btime = Math.max(0, time.btime - elapsed);
    //     }
    //   }
    // }

    // function startClock() {
    //     console.log("inside start clock")
    //   if (game.turn() === "w") {
    //     time.wtime += time.winc;
    //     time.clockColor = "white";
    //   } else {
    //     time.btime += time.binc;
    //     time.clockColor = "black";
    //   }
    //   time.startTime = Date.now();
    // //   clockTick();
    // }

    function get_moves() {
        console.log("inside get moves")
      let moves = "";
      let history = game.history({ verbose: true });
     // console.log("history",history)

      for (let i = 0; i < history.length; ++i) {
        let move = history[i];
        moves +=
          " " + move.from + move.to + (move.promotion ? move.promotion : "");
      }
      //console.log("moves",moves)
      return moves;
    }

    const prepareMove = () => {
        console.log("inside prepare moves")
     // stopClock();
      // this.setState({ fen: game.fen() });
      let turn = game.turn() === "w" ? "white" : "black";
      if (!game.game_over()) {
        // if (turn === playerColor) {
        if (turn !== playerColor) {
          // playerColor = playerColor === 'white' ? 'black' : 'white';
          uciCmd("position startpos moves" + get_moves());
          uciCmd("position startpos moves" + get_moves(), evaler);
          uciCmd("eval", evaler);
          //console.log("position startpos moves" , get_moves());
          //console.log("position startpos moves" , get_moves(), evaler);
          //console.log("eval", evaler);
          if (time && time.wtime) {
            uciCmd(
              "go " +
                (time.depth ? "depth " + time.depth : "") +
                " wtime " +
                time.wtime +
                " winc " +
                time.winc +
                " btime " +
                time.btime +
                " binc " +
                time.binc
            );
          } else {
            uciCmd("go " + (time.depth ? "depth " + time.depth : ""));
          }
          // isEngineRunning = true;
        }
        if (game.history().length >= 2 && !time.depth && !time.nodes) {
          //startClock();
        }
      }
    };

    evaler.onmessage = function(event) {
        console.log("inside evaler.onmessgae")
      let line;

      if (event && typeof event === "object") {
        line = event.data;
      } else {
        line = event;
      }

      // console.log('evaler: ' + line);

      /// Ignore some output.
      if (
        line === "uciok" ||
        line === "readyok" ||
        line.substr(0, 11) === "option name"
      ) {
        return;
      }
    };

    engine.onmessage = async(event) => {
        console.log("inside engine.onmessage")
      let line;

      if (event && typeof event === "object") {
        line = event.data;
      } else {
        line = event;
      }
      // console.log('Reply: ' + line);
      if (line === "uciok") {
        engineStatus.engineLoaded = true;
      } else if (line === "readyok") {
        engineStatus.engineReady = true;
      } else {
        let match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
        /// Did the AI move?
        if (match) {
          // isEngineRunning = false;
          //console.log("from",match[1],"to",match[2],"promotion",match[3])
          game.move({ from: match[1], to: match[2], promotion: match[3] });
          console.log("computer is making a move")
          var synth = await window.speechSynthesis;
          var toSpeak = await new SpeechSynthesisUtterance(`the computer moved ${match[1]} to ${match[2]}`);
          var voices = await synth.getVoices();
          console.log(voices)
          // console.log(voices)
          toSpeak.voice=voices[0]
          synth.speak(toSpeak);
          //console.log("making movee")
          this.setState({ fen: game.fen() });
          prepareMove();
          uciCmd("eval", evaler);
          //uciCmd("eval");
          /// Is it sending feedback?
        } else if (
          (match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/))
        ) {
          engineStatus.search = "Depth: " + match[1] + " Nps: " + match[2];
        }

        /// Is it sending feed back with a score?
        if ((match = line.match(/^info .*\bscore (\w+) (-?\d+)/))) {
          let score = parseInt(match[2], 10) * (game.turn() === "w" ? 1 : -1);
          /// Is it measuring in centipawns?
          if (match[1] === "cp") {
            engineStatus.score = (score / 100.0).toFixed(2);
            /// Did it find a mate?
          } else if (match[1] === "mate") {
            engineStatus.score = "Mate in " + Math.abs(score);
          }

          /// Is the score bounded?
          if ((match = line.match(/\b(upper|lower)bound\b/))) {
            engineStatus.score =
              ((match[1] === "upper") === (game.turn() === "w")
                ? "<= "
                : ">= ") + engineStatus.score;
          }
        }
      }
      // displayStatus();
    };

    return {
      start: function() {
          console.log("inside start in return")
        uciCmd("ucinewgame");
        uciCmd("isready");
        engineStatus.engineReady = false;
        engineStatus.search = null;
        prepareMove();
        announced_game_over = false;
      },
      prepareMove: function() {
        prepareMove();
      }
    };
  };

  render() {
    const { fen } = this.state;
    //console.log("fen",fen)
    //console.log(this.props);
    return this.props.children({ position: fen, onDrop: this.onDrop ,game:game});
  }
}

export default Stockfish;
