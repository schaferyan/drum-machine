import React from 'react';
import './DrumMachine.css';
import {playSample} from './audioFunctions'

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
    this.state = { display: "PLAY ME", vol: 0.7 };
    this.setDisplay = this.setDisplay.bind(this);
    this.onPadTriggered = this.onPadTriggered.bind(this);
    this.handleVolChange = this.handleVolChange.bind(this);
  }

  onPadTriggered(char) {
    const sample = this.props.soundBank[char].sample;
    playSample(this.props.audioContext, sample, 0, this.state.vol);
    const name = this.props.soundBank[char].name;
    this.setDisplay(name);
  }

  setDisplay(soundName) {
    this.setState({
      display: soundName
    });
  }
  handleVolChange = (event) => {
    this.setState({ vol: event.target.value });
    console.log(this.state.vol);
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
        <DrumPadArea keyset={this.props.keyset} soundBank={this.props.soundBank} onPadTriggered={this.onPadTriggered} />
        <ControlArea handleVolChange={this.handleVolChange} />
      </div>
    );
  }
}

/*passed keyset as prop to avoid redundancy and improve modability
implemented gain node to restore master volume control*/


