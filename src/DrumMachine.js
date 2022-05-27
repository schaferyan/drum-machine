import React, { useState } from 'react';
import './DrumMachine.css';
import * as AudioFunctions from './audioFunctions'



const Display = (props) => {
  return <div id="display">{props.display}</div>;
};

const Slider = (props) => {
  return (
    <div className="control-element">
      <input id={props.id} type="range" className="slider" min="0" max="1" step="0.02"  onChange={props.handleChange} />
      <label id={props.labelId} className="slider-label">{props.label}</label>
    </div>
  );
};

// TODO hide curser, force double, change to 'type="number"' and add custom logic to only show numerial values within range, or '' for 0
const TempoControl = (props) => {
	const [visibleValue, setVisibleValue] = useState(props.bpm);
	function handleInput(event){
		setVisibleValue(event.target.value);
		if(event.target.value >= 40.0 && event.target.value <= 999.0){
			props.setBpm(event.target.value);
		}
	}
	return(
		<div className="control-element" id="tempo-control" >
			<input className="text-input" type="number" value={visibleValue} onChange={handleInput}/>
			<label>bpm</label>
		</div> 
		)
}

const LoopLength = (props) => {
	const [visibleValue, setVisibleValue] = useState(props.loopLength);
	function handleInput(event){
		setVisibleValue(event.target.value);
		if(event.target.value >= 1 && event.target.value <= 20){
			props.setLoopLength(event.target.value);
		}
	}
	return(
		<div className="control-element" id="loop-length" >
			<input className="text-input" type="number" value={visibleValue} onChange={handleInput}/>
			<label>bars</label>
		</div> 
		)
}

const MetronomeSwitch = (props) => {
	return(
		<div className="control-element" id="metronome-switch">
			<input className="check-box"  type="checkbox" name="metronome" id="metronome-checbox" onChange={props.handleChange} checked={props.checked}/>
			<label htmlFor="metronome-checbox">Metronome</label>
		</div>
		)
}

const DrumPad = (props) => {
  const handleClick = (event) => {
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

const RecordButton = (props) => {
	let buttonText;
	if(props.overdub){
		buttonText = "OVD"
	}else{
		buttonText = "REC"
	}
	return (
		<button onClick={props.handleRecordStart} id="button-record" className="playback-control">
			{buttonText}
		</button>
		);
};

const QuantizationControl = (props) => {
	return(
		<div>
			<label htmlFor="quantization-select">Quantization</label>
			<select name="quantization" id="quantization-select" value={props.quantization} onChange={props.handleChange} disabled={props.disabled}>
				<option value="1">1/4</option>
				<option value="0.5">1/8</option>
				<option value="0.25">1/16</option>
				<option value="0.125">1/32</option>
			</select>
		</div>
		)
}

const ControlArea = (props) => {
  return (
    <div id="control-area">
      <Slider id="master-volume" label="Master" labelId="master-volume-label" handleChange={props.handleVolChange} />
      <RecordButton handleRecordStart={props.handleRecordStart} overdub={props.overdub}/>
      <button onClick={props.handleStop} id="button-stop" className="playback-control">STOP</button>
      <button onClick={props.handlePlayPressed} id="button-play" className="playback-control">PLAY</button>
      <button onClick={props.handleClearPressed} id="button-clear" className="loop-controls">CLEAR</button>
      <MetronomeSwitch handleChange={props.handleMetronomeChange} checked={props.metronomeChecked}/>
      <LoopLength setLoopLength={props.setLoopLength} loopLength={props.loopLength}/>
      <TempoControl setBpm={props.setBpm} bpm={props.bpm}/>
      <QuantizationControl handleChange={props.handleQuantizationChange} quantization={props.quantization} disabled={props.quantizeDisabled}/>
    </div>
  );
};

export default class DrumMachine extends React.Component {
  constructor(props) {
    super(props);
    if(localStorage.getItem("state")){
    	const savedState = JSON.parse(localStorage.getItem("state"));
    	this.state = {...savedState, display: "PLAY ME", recording: false, playing: false, currentStep: 0, 
    	nextNoteTime: 0, startTime: 0, overdub: false};
    }else{
    	this.state = { display: "PLAY ME", vol: 1.0, bpm: 120.0, loopLength: 2, quantization: 0.5, 
    	sequence: [], metronome: true, recording: false, playing: false, currentStep: 0, nextNoteTime: 0, 
    	startTime: 0, overdub: false };
    }
    
    this.setDisplay = this.setDisplay.bind(this);
    this.onPadTriggered = this.onPadTriggered.bind(this);
    this.handleVolChange = this.handleVolChange.bind(this);
    this.handleRecordStart = this.handleRecordStart.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handlePlayPressed = this.handlePlayPressed.bind(this);
    this.handleClearPressed = this.handleClearPressed.bind(this);
    this.scheduler = this.scheduler.bind(this);
    this.setBpm = this.setBpm.bind(this);
    this.setLoopLength = this.setLoopLength.bind(this);

  }

  handleRecordStart(){
  	if(this.state.recording){
  		return;
  	}
  	document.getElementById('button-record').classList.add('button-active');
  	if(this.state.playing){
  		this.setState({recording: true});
  		return;
  	}
  	const beatLength = 60.0/this.state.bpm;
  	const currentTime = this.props.audioContext.currentTime;
  	const startTime = currentTime + 4 * beatLength;
  	this.setState({recording: true, playing: true, startTime: startTime}, () => {
  		this.startClock(this.state.startTime);
  	});
  	AudioFunctions.countOff(this.props.audioContext, currentTime, beatLength, this.state.quantization);
  }


  handleStop(){
  	this.setState({recording: false, playing: false, startTime: null});
  	console.log("stopped, reading clickIntervalId: " + this.state.clickIntervalId)
  	clearInterval(this.state.clickIntervalId);
  	document.getElementById('button-record').classList.remove('button-active');
  	const {vol, bpm, loopLength, quantization, sequence, metronome, overdub} = this.state;
  	localStorage.setItem("state", JSON.stringify({vol, bpm, loopLength, quantization, sequence, metronome, overdub}));
  }

  

  handlePlayPressed(){
  	if(this.state.playing){
  		return;
  	}
  	this.setState({playing: true});
  	this.startClock(this.props.audioContext.currentTime);
  }

  handleClearPressed(){
  	this.setState({sequence: [], overdub: false});
  }

// fix duration of pad highlighting to match length sample sustains -  may require unit conversion
  onPadTriggered(char) {
    const duration = AudioFunctions.playSample(this.props.audioContext, char, this.props.soundBank, this.props.gainNode, 
    	0);
    const name = this.props.soundBank[char].name;
    this.setDisplay(name);
    const pad = document.getElementById(char);
    pad.classList.add('drum-pad-active');
    setTimeout(() => {pad.classList.remove('drum-pad-active')}, duration);
    if(this.state.recording && this.state.playing){
    	this.recordTrigger(char);
    }
  }

  setDisplay(soundName) {
    this.setState({
      display: soundName
    });
  }

  recordTrigger(char){
  		let triggerTime = this.props.audioContext.currentTime - this.state.startTime;
  		const beatLength = 60.0/this.state.bpm;
  		const step = Math.round(triggerTime/(beatLength * this.state.quantization));
		let { sequence } = this.state;
  		if(this.state.sequence[step]){
  			sequence[step].push(char);
    		
   		}else if(triggerTime >= 0){
    		sequence[step] = [char];
  		}
  		this.setState((prevState)=>({
    		sequence: sequence
    	}));
  	}

  nextStep() {
    let secondsPerBeat = 60.0 / this.state.bpm;        
    this.setState((prevState, props)=>({nextNoteTime: prevState.nextNoteTime + secondsPerBeat * prevState.quantization,
    	currentStep: prevState.currentStep + 1 })); 
    if(this.state.currentStep === (this.state.loopLength * 4) / this.state.quantization){
      this.repeatLoop();
  	}
  }


  scheduler(){
  	let marker = this.props.audioContext.currentTime + this.props.scheduleAheadTime;
  	while (this.state.nextNoteTime < marker ) {
    	AudioFunctions.scheduleNote(this.props.audioContext, this.props.soundBank, this.props.gainNode, this.state.nextNoteTime, 
    	this.state.sequence, this.state.currentStep);
    	if(this.state.metronome && this.state.currentStep % (1/this.state.quantization) === 0){
       		AudioFunctions.scheduleClick( this.props.audioContext, this.state.currentStep, 
       			this.state.nextNoteTime, this.state.quantization );
    	}
      	this.nextStep();
    }
  }

  startClock(startTime){
  	this.setState({currentStep: 0, nextNoteTime: startTime});
  	let clickIntervalId = setInterval(this.scheduler, this.props.lookahead);
  	this.setState({clickIntervalId: clickIntervalId});
  	console.log("starting metronome with clickIntervalId = " + this.state.clickIntervalId);
  }

  repeatLoop(){
  	let overdub;
  	if(this.state.sequence.length > 0){
  		overdub = true;
  	}
  	this.setState((prevState, props)=>({currentStep: 0, startTime: prevState.nextNoteTime, overdub: overdub}));
  }

  handleVolChange = (event) => {
    this.setState({ vol: event.target.value });
    this.props.gainNode.gain.value = this.state.vol;
  };

  setBpm(bpm){
  	console.log("recieved input " + bpm);
  	this.setState({ bpm: bpm});
  }
  setLoopLength(length){
  	console.log("recieved input " + length);
  	this.setState({ loopLength: length});
  }

  handleLoopLengthChange = (event) => {
	this.setState({loopLength: event.target.value})
  }

  handleMetronomeClick = (event) => {
  	this.setState((prevState, props) => ({metronome: !prevState.metronome}))
  };

  handleQuantizationChange = (event) => {
  	console.log("user selected a quantization")
  	this.setState({quantization: event.target.value}, ()=>{console.log("quantization was changed to " + this.state.quantization)});
  }

  onKeyDown = (event) => {
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
        handleRecordStart={this.handleRecordStart} handleStop={this.handleStop} setBpm={this.setBpm} setLoopLength={this.setLoopLength} handleLoopLengthChange ={this.handleLoopLengthChange}
        handleClearPressed={this.handleClearPressed} handleMetronomeChange={this.handleMetronomeClick} handleQuantizationChange={this.handleQuantizationChange} 
        quantization={this.state.quantization} quantizeDisabled={this.state.playing} metronomeChecked={this.state.metronome} overdub={this.state.overdub}/>
      </div>
    );
  }
}