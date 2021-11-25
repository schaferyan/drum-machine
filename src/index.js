import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DrumMachine from './DrumMachine';
import reportWebVitals from './reportWebVitals';
import * as AudioFunctions from './audioFunctions';
import sounds from './samples.js';


const keyset = ["Q","W","E","A","S","D","Z","X","C"];

AudioFunctions.prepAudio(sounds, keyset)
    .then(() => {
     ReactDOM.render(
  		<React.StrictMode>
    		<DrumMachine keyset={keyset}/>
 		 </React.StrictMode>,
  		document.getElementById('root')
);
   
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
