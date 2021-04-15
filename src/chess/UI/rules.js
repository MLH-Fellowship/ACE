import React from "react";

export const Rules = ({ showRules, setOpenRules }) => {
  return (
    <div
      style={{
        display: `${showRules ? "block" : "none"}`,
      }}
    >
      <div className="rules-overlay">
        <div
          style={{
            width: "60%",
            height: "90vh",
            display: "flex",
            paddingLeft: "3em",
            paddingRight: "3em",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
          }}
          onClick={setOpenRules}
        >
          <p style={{ textAlign: "left", fontSize: "18px", padding: "10px" }}>
            <h3>Instructions</h3>
            <i class="fas fa-chess-pawn"></i> ACE is a two player voice powered
            accessible chess game for the visually impaired. You can press the
            start button or press enter key to start the game.
            <br />
            <br />
            <i class="fas fa-chess-pawn"></i> You will be redirected to the link
            screen where the game link will automatically be copied on your
            clipboard. You can click on the link or press enter to copy it again
            if required. You can now send this link to a friend and start
            playing.
            <br />
            <br />
            <i class="fas fa-chess-pawn"></i> Once you are on the game screen,
            the player who has created the game is assigned white and makes the
            first move. To make a move, press spacebar and say "Move" (or click
            on move button), the computer will guide you through making your
            move using voice commands.
            <br />
            <br />
            <i class="fas fa-chess-pawn"></i> Every time your opponent makes a
            move, the move will be spoken to you by the computer. If you want to
            repeat it again, press spacebar and say "Repeat" (or click on the
            repeat button) and the computer will reiterate your opponents move.
            <br />
            <br />
            <i class="fas fa-chess-pawn"></i> In the event you want a summary of
            the chessboard, you can hit spacebar (or press speak positions
            button) and say "Speak positions", the computer will repeat
            positions of all pieces on the board.
            <br />
            <br />
            <i class="fas fa-chess-pawn"></i> In case you want to know the piece
            at a particular square, hit spacebar (or press find button) and say
            "Find" and the computer will help you find the piece on the square
            you request.
            <br />
            <br />
            <i class="fas fa-chess-pawn"></i> The computer will alert you when
            you make an invalid move, when your king is in check, when you or
            your opponent is checkmated or either players resign.
            <br />
            <br />
            <i class="fas fa-chess-pawn"></i> Finally, you can resign the game
            by hitting spacebar and saying "Resign", the computer will ask you
            for confirmation, and once confirmed the game will end.
            <br />
          </p>
        </div>
      </div>
    </div>
  );
};
