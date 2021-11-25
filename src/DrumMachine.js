import React from 'react';
import './DrumMachine.css';
import {playSample, getDuration, getSampleName, setGain} from './audioFunctions'

const Display = (props) => {
  return <div id="display">{props.display}</div>;
};

const MasterVolume = (props) => {
  return (
    <div className="control-element">
      <input type="range" className="slider" min="0" max="1" step="0.02"  onChange={props.handleChange} />
      <label className="slider-label">Volume</label>
    </div>
  );
};

const DrumPad = (props) => {
  const handleClick = (event) => {
    props.onPadTriggered(props.char);
  };

  return (
    <div className="drum-pad" id={props.char} onClick={handleClick}>
      {props.char}
    </div>
  );
};


const DrumPadArea = (props) => {
  return (
    <div id="drum-pad-area">
      {props.keyset.map((char) => (
        <DrumPad
          char={char}
          onPadTriggered={props.onPadTriggered}
        />
      ))}
    </div>
  );
};

const ControlArea = (props) => {
  return (
    <div id="control-area">
      <MasterVolume handleChange={props.handleVolChange} />
    </div>
  );
};

export default class DrumMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = { display: "PLAY ME", vol: 1.0 };
    this.setDisplay = this.setDisplay.bind(this);
    this.onPadTriggered = this.onPadTriggered.bind(this);
    this.handleVolChange = this.handleVolChange.bind(this);
  }

  onPadTriggered(char) {
    playSample( char, 0, this.state.vol);
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

  onKeyDown = (event) => {
    const keyCode = event.which || event.keyCode;
    const char = String.fromCharCode(keyCode);
    if(this.props.keyset.includes(char)){
      this.onPadTriggered(char);
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
        ref="component"
      >
        <Display display={this.state.display} />
        <DrumPadArea keyset={this.props.keyset} onPadTriggered={this.onPadTriggered} />
        <ControlArea handleVolChange={this.handleVolChange} />
      </div>
    );
  }
}



/*added abstraction layer by moving audio details to audioFunctions.js*/


