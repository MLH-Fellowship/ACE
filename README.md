# ACE - Accessible Chess Experience

**ACE** (Accessible Chess Experience) is a real time voice powered chess application which 
lets you play online with your friends. The game has features like moving pieces, finding pieces on board, getting board summary, repeating opponent moves, and much more, all implemented using voice commands.

## Inspiration
We looked online and found out that two of the most popular chess websites, lichess and chess.com, have no voice options for the visually impaired. We wanted to create something, that can help those who are visually impaired to have a complete experience without the hassle on relying on screen readers for every single move. And thus originated the idea of voice powered chess, ACE. 

## Features
1. Play chess online with your friends using voice commands

2. Move chess piece using voice 

3. Find piece on a particular square 

4. Get chessboard summary

5. Get voice alerts for invalid moves, check and checkmate situations


## Tech Stack
1. Frontend - ReactJS
2. Backend - NodeJS
3. Speech-To-Text - Azure Speech SDK
4. Real Time Communications - Web Sockets

## Try It Yourself
Here is a link to the [website](https://ace-chess.herokuapp.com)

## Contributing to ACE
1. ACE uses Azure text to speech API for speech recognition. The project requires a speech resource on Azure portal (to get access to SPEECH_KEY and SPEECH_REGION). However if you are interested in contributing to the project but unable to make an azure speech resource, we will share azure credentials to get you started on contrinuting to this project. You can join our [discord server](https://discord.gg/EmtXC9xug6) to get access to azure speech key and region.

2. All issues for this project are created here on this frontend repository, however you can make changes to backend as well and submit PR on backend repository as well.

## Dev Setup

### Prerequisites
- NodeJS
- npm
- Azure account and Azure Speech Resource

### Start the server 
[Link to backend repository](https://github.com/suhanichawla/ACE-Backend)

1. Clone the above repository
2. cd into the ACE-Backend folder
3. Create a .env file and add the SPEECH_KEY and SPEECH_REGION from your azure speech service credenials. (Refer to .env.example file)
3. Go to the terminal and run the following commands

```
npm install
node app.js
```
The server will be started at localhost:8000

### Start the client
1. Clone this repository
2. cd into the ACE folder
3. Open the config.js file in src/services folder
4. Replace CLIENT_URL with http://localhost:3000
5. Replace SERVER_URL with http://localhost:8000
3. Go to the terminal and run the following commands

```
npm install

npm start
```
Visit localhost:3000 to play the game

## Screenshots
![image](https://user-images.githubusercontent.com/44273715/111841275-bb0d3e00-8923-11eb-8017-9d6b16800051.png)

