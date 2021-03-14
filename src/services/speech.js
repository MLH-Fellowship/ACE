import { getTokenOrRefresh } from './token_util';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

//uncomment these for web speech api
// var SpeechRecognition;
// var recognition;

var speechConfig;
var synth;
var voices;

class SpeechHandler{
    
    static async initializeTextToSpeech(){
        synth = await window.speechSynthesis;
        synth.onvoiceschanged = async function() {
            voices = await synth.getVoices();
            console.log(voices);
            
        };
    }

    static async initializeSpeechToText(){
        const tokenRes = await getTokenOrRefresh();
        if (tokenRes.authToken === null) {
            console.log(tokenRes.error)
        }
        speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenRes.authToken, tokenRes.region);
        speechConfig.speechRecognitionLanguage = 'en-US';
        
        //uncomment this for web speech api implementation

        // SpeechRecognition = SpeechRecognition || await window.webkitSpeechRecognition;
        // recognition = new SpeechRecognition();
        // recognition.onstart=function(){
        //     console.log("started")
        // }
        // recognition.onspeechend=function(){
        //     console.log("ended")
        // }
        
        // recognition.onresult=function(event){
        //     var current=event.resultIndex;
        //     var transcript=event.results[current][0].transcript
        //     console.log(transcript)
        // }
        
        // recognition.onerror=function(){
        //     alert("error")
        // }

        // recognition.start()
    }

    static async speakThis(textToSpeak){
        if(voices && voices.length && voices.length>0){
            var toSpeak = await new SpeechSynthesisUtterance(textToSpeak);
            toSpeak.voice=voices[0]
            synth.speak(toSpeak);
        }else{
            synth.onvoiceschanged = async function() {
                voices = await synth.getVoices();
                console.log(voices);
                var toSpeak = await new SpeechSynthesisUtterance(textToSpeak);
                toSpeak.voice=voices[0]
                synth.speak(toSpeak);
            };

           
        }   
    }

    static hearThis(callback){
        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(result => {
            let displayText;
            if (result.reason === ResultReason.RecognizedSpeech) {
                displayText = `RECOGNIZED: Text=${result.text}`
            } else {
                displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
            }
            console.log(displayText)
            //write all commands as if else statements over here
            //some cleaning of data required
            if (displayText=="command thats required"){
                // after recoganizing command, callback with the correct command code
                // the command code will be received in chessgame.js
                // add/delete parameters in the callback function in chessgame.js if some data needs to be sent back
                callback(1);
            }
        });

    }

    static stopHearing(){
        //To clean up after recognition or to call speaking functions after hearing stops
        //This function call be used to fire text to speech responses after users comand
        //example: this.speakThis("I can speak after recognition stops")
    }
}


export default SpeechHandler;