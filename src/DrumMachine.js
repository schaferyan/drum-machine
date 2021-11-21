import React from 'react';
import './DrumMachine.css';

const keys = ["Q", "W", "E", "A", "S", "D", "Z", "X", "C"];
const sounds = [
  {
    name: "ANALOG KICK",
    src:
    	"samples/Kicks/analogbd.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Kicks/18[kb]analogbd.wav.mp3"

  },
  {
    name: "ACCOUSTIC SNARE",
    src:
    	"samples/Snares/acoustic_snare.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Snares/61[kb]acoustic_snare.wav.mp3"
  },
  {
    name: "CLEAR HAT",
    src:
    	"samples/Hats/clear-hat.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Hats/14[kb]clear-hat.wav.mp3"
  },
  {
    name: "AMBIENT TOM",
    src:
    	"samples/Toms/ambient_tom_1.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Toms/264[kb]ambient_tom_1.wav.mp3"
  },
  {
    name: "HAND CLAP",
    src:
    	"samples/Claps/HandClap.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Claps/7[kb]HandClap.wav.mp3"
  },
  {
    name: "NORMAL CRASH",
    src:
    	"samples/Crashes/normal-crash.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Crashes/123[kb]normal-crash.wav.mp3"
  },
  {
    name: "CRYSTAL RIDE",
    src:
    	"samples/Rides/crystal_ride.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Rides/139[kb]crystal_ride.wav.mp3"
  },
  {
    name: "SATISFY 1",
    src:
    	"samples/Melodic_Hits/stab-satisfying-1.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Melodic%20Stabs%20and%20Hits/1166[kb]stab-satisfying-1.wav.mp3"
  },
  {
    name: "SATISFY 2",
    src:
    	"samples/Melodic_Hits/stab-satisfying-10.wav"
      // "https://sampleswap.org/samples-ghost/DRUMS%20(SINGLE%20HITS)/Melodic%20Stabs%20and%20Hits/1166[kb]stab-satisfying-10.wav.mp3"
  }
];

const soundBank = {};
for (let i = 0; i < keys.length; i++) {
  soundBank[keys[i]] = sounds[i];
}

const Display = (props) => {
  return <div id="display">{props.display}</div>;
};

const MasterVolume = (props) => {
  return (
    <div className="control-element">
      <input type="range" className="slider" onChange={props.handleChange} />
      <label className="slider-label">Volume</label>
    </div>
  );
};

const DrumPad = (props) => {
  const handleClick = (event) => {
    props.playSound(props.note);
  };

  return (
    <div className="drum-pad" id={props.id} onClick={handleClick}>
      {props.note}
      <Sound note={props.note} />
    </div>
  );
};

const Sound = (props) => {
  return (
    <audio
      src={soundBank[props.note].src}
      className="clip"
      id={props.note}
      preload="auto"
    />
  );
};

const DrumPadArea = (props) => {
  return (
    <div id="drum-pad-area">
      {keys.map((char) => (
        <DrumPad
          id={soundBank[char].name}
          note={char}
          playSound={props.playSound}
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
    this.state = { display: "PLAY ME", vol: 1 };
    this.setDisplay = this.setDisplay.bind(this);
    this.playSound = this.playSound.bind(this);
    this.handleVolChange = this.handleVolChange.bind(this);
  }

  playSound(note) {
    const sound = document.getElementById(note);
    sound.currentTime = 0.0;
    sound.volume = this.state.vol;
    sound.play();
    const name = soundBank[note].name;
    this.setDisplay(name);
  }

  setDisplay(soundName) {
    this.setState({
      display: soundName
    });
  }
  handleVolChange = (event) => {
    this.setState({ vol: event.target.value / 100 });
    console.log(this.state.vol);
  };

  onKeyDown = (event) => {
    const keyCode = event.which || event.keyCode;
    const note = String.fromCharCode(keyCode);
    if(keys.includes(note)){
      this.playSound(note);
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
        <DrumPadArea playSound={this.playSound} />
        <ControlArea handleVolChange={this.handleVolChange} />
      </div>
    );
  }
}

