# ACE - Accessible Chess Experience

This project aims to build a speech activation driven chess game, specifically geared towards the blind.  
The deployed version can be accessed at: https://ace-chess.herokuapp.com/
  
# Downloading and preparing the repositories locally

The first step is to clone both the frontent repository at https://github.com/MLH-Fellowship/ACE and the backend repository at https://github.com/suhanichawla/ACE-Backend
  
To clone:  
`
git clone https://github.com/MLH-Fellowship/ACE.git  
git clone https://github.com/suhanichawla/ACE-Backend.git  
`
  
First, install React (create-react-app) and Node.js (https://nodejs.org/en/download/), and pm (https://www.npmjs.com/get-npm).  
After the repositories are cloned onto your local machine, first cd into the ACE repository.  
`cd /path_to_repo/ACE`  
After you have entered the repository through your terminal, run the following to install all dependencies:  
`npm install`  
  
Next, cd into the ACE-backend repository.  
`cd /path_to_backend_repo/ACE-backend`  
After you have entered the repository through your terminal, run the following again:
`npm install`  

# Running the app locally
To run the app, we must have two terminals open simultaneously; one in ACE and the other ACE-backend.  
In the ACE terminal, run:  
`npm start` to start the frontend.  
In the ACE-backend terminal, run:  
`node app.js` to initialize the backend.  