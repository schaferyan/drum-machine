import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DrumMachine from './DrumMachine';
import reportWebVitals from './reportWebVitals';
import * as AudioFunctions from './audioFunctions';
import sounds from './samples.js';


const keyset = ["Q","W","E","A","S","D","Z","X","C"];
const lookahead = 25.0;
const scheduleAheadTime = 0.1;

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

AudioFunctions.setupSamples(audioContext, sounds, keyset)
    .then((soundBank) => {
    	const gainNode = AudioFunctions.createGainNode(audioContext);
     ReactDOM.render(
  		<React.StrictMode>
    		<DrumMachine audioContext={audioContext} gainNode={gainNode} keyset={keyset} lookahead={lookahead} 
    		scheduleAheadTime={scheduleAheadTime} soundBank={soundBank}/>
 		 </React.StrictMode>,
  		document.getElementById('root')
	);
});

const setBg = () => {
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        const color = document.getElementById("color");
        document.body.style.backgroundColor = "#" + randomColor;
        color.innerHTML = "#" + randomColor;
      }
const genNew = document.getElementById("genNew");
genNew.addEventListener("click", setBg);
setBg();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
