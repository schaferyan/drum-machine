import React from 'react';
import './DrumMachine.css';
import {playSample, getDuration, getSampleName, setGain, recordStart, stop, playLoop, setBpm, getInstant, setLoopLength, clearLoop} from './audioFunctions'

const Display = (props) => {
  return <div id="display">{props.display}</div>;
};

const MasterVolume = (props) => {
  return (
    <div className="control-element" id="master-volume">
      <input type="range" className="slider" min="0" max="1" step="0.02"  onChange={props.handleChange} />
      <label className="slider-label">Volume</label>
    </div>
  );
};

// TODO hide curser, force double, change to 'type="number"' and add custom logic to only show numerial values within range, or '' for 0
const TempoControl = (props) => {
	return(
		<div className="control-element" id="tempo-control" >
			<input className="text-input" type="number" min="40.0" max="900.0" value={props.bpm} onChange={props.handleChange}/>
			<label>bpm</label>
		</div> 
		)
}

const LoopLength = (props) => {
	return(
		<div className="control-element" id="loop-length" >
			<input className="text-input" type="number" min="1" max="100" value={props.loopLength} onChange={props.handleChange}/>
			<label>bars</label>
		</div> 
		)
}

const DrumPad = (props) => {
  const handleClick = (event) => {
  	console.log(props.char + " clicked at " + getInstant() );
    props.onPadTriggered(props.char);
  };

  return (
    <div className="drum-pad" id={props.char} onMouseDown={handleClick}>
      {props.char}
    </div>
  );
};


const DrumPadArea = (props) => {
  return (
    <div id="drum-pad-area">
      {props.keyset.map((char, index) => (
        <DrumPad
          char={char}
          onPadTriggered={props.onPadTriggered}
          key={char + index}
        />
      ))}
    </div>
  );
};

const ControlArea = (props) => {
  return (
    <div id="control-area">
      <MasterVolume handleChange={props.handleVolChange} />
      
      <button onClick={props.handleRecordStart} id="button-record" className="playback-control">REC</button>
      <button onClick={props.handleStop} id="button-stop" className="playback-control">STOP</button>
      <button onClick={props.handlePlayPressed} id="button-play" className="playback-control">PLAY</button>
      <button onClick={props.handleClearPressed} id="button-clear" className="loop-controls">CLEAR</button>
      <LoopLength handleChange={props.handleLoopLengthChange} loopLength={props.loopLength}/>
      <TempoControl handleChange={props.handleBpmChange} bpm={props.bpm}/>
    </div>
  );
};

export default class DrumMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = { display: "PLAY ME", vol: 1.0, bpm: 120.0, loopLength: 2 };
    this.setDisplay = this.setDisplay.bind(this);
    this.onPadTriggered = this.onPadTriggered.bind(this);
    this.handleVolChange = this.handleVolChange.bind(this);
    this.handleRecordStart = this.handleRecordStart.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handlePlayPressed = this.handlePlayPressed.bind(this);
    this.handleClearPressed = this.handleClearPressed.bind(this);
  }

  handleRecordStart(){
  	this.setState({recording: true, playing: true});
  	recordStart();
  	document.getElementById('button-record').classList.add('button-active');
  }

  handleStop(){
  	this.setState({recording: false, playing: false});
  	stop();
  	document.getElementById('button-record').classList.remove('button-active');
  }

  handlePlayPressed(){
  	this.setState({playing: true});
  	playLoop();
  }

  handleClearPressed(){
  	clearLoop();
  }

  onPadTriggered(char) {
  	console.log(char + " pad triggered at" + getInstant())
    playSample( char, 0, this.state.recording);
    const name = getSampleName(char);
    this.setDisplay(name);
    const pad = document.getElementById(char);
    pad.classList.add('drum-pad-active');
    setTimeout(() => {pad.classList.remove('drum-pad-active')}, getDuration(char));
  }

  

  setDisplay(soundName) {
    this.setState({
      display: soundName
    });
  }

  handleVolChange = (event) => {
    this.setState({ vol: event.target.value });
    setGain(this.state.vol);
  };

  handleBpmChange = (event) => {
  	this.setState({ bpm: event.target.value * 1.0 });
  	if (this.state.bpm > 40.0){
  		setBpm(this.state.bpm);
  	}
  }

  handleLoopLengthChange = (event) => {
	this.setState({loopLength: event.target.value})
	if(this.state.loopLength >= 1 && this.state.loopLength <= 100){
		console.log("calling set loop length ");
		setLoopLength(this.state.loopLength);
	}
  }

  onKeyDown = (event) => {
  	console.log("key pressed at " + getInstant())
    const char = event.key.toUpperCase();
    // const char = String.fromCharCode(keyCode);
    console.log(char)
    if(this.props.keyset.includes(char)){
      this.onPadTriggered(char);
    }
    else if(char === " " && (this.state.playing || this.state.recording)){
    	this.handleStop();
    }
    else if(char === " "){
    	this.handlePlayPressed();
    }
  };

  componentDidMount() {
    this.refs.component.focus();
  }

  render() {
    return (
      <div
        id="drum-machine"
        onKeyDown={this.onKeyDown}
        tabIndex="0"
        ref="component">
        <Display display={this.state.display} />
        <DrumPadArea keyset={this.props.keyset} onPadTriggered={this.onPadTriggered} />
        <ControlArea bpm={this.state.bpm} loopLength={this.state.loopLength} handlePlayPressed={this.handlePlayPressed} handleVolChange={this.handleVolChange} 
        handleRecordStart={this.handleRecordStart} handleStop={this.handleStop} handleBpmChange={this.handleBpmChange} handleLoopLengthChange ={this.handleLoopLengthChange}
        handleClearPressed={this.handleClearPressed}/>
      </div>
    );
  }
}



