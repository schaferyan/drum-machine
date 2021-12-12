// TODO fix problem with gainNode - possibly a scope issue

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const soundBank = {};

let gainNode;

let startTime = null;
let bpm = 120.0;
let quantization = 0.5;
// const triggerList = [];
const sequence = [];
let loopLengthInBars = 2;

let currentStep = 0;
let lookahead = 25.0;
let scheduleAheadTime = 0.1;
let nextNoteTime = 0.0;
let clickIntervalID = null;
let metronome = true;

// In order to be able to loop continuously and stop on request, we need to schedule events just beofre they happen 
// (within the scheduleAhead time range) instead of as soon as play or record is pressed. This means events need to be stored in order.
// It also means that either click events and triggers need to be stored in a single qeue, or we need to look at both the qeue and the clicks
// seperately in the scheduler function

document.addEventListener("mousemove", function() {
  audioContext.resume();
}, {once : true});

document.addEventListener("keydown", function() {
  audioContext.resume();
}, {once : true});

async function getFile( filepath) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

async function setupSamples( samples, keyset) {	
	for (let i = 0; i < keyset.length; i++){
		const filePath = samples[i].src;
		const sample = await getFile( filePath);
		soundBank[keyset[i]] = {name: samples[i].name, sample: sample};
  }
}

async function prepAudio( samples, keyset){
  setupSamples( samples, keyset);
  gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
}



function recordStart(){
  console.log("record request recieved");
  countOff();
  playLoop();
  console.log("record started at " + startTime);
}

function countOff(){
  const countStart = audioContext.currentTime;
  const beatLength = 60.0/bpm;
  for(let i=0; i< 4; i++){
    scheduleClick(0, countStart + i * beatLength);
  };
  startTime = countStart + 4 * beatLength;
}

function stop(){
  // stop the metronome
  clearInterval(clickIntervalID);
  startTime = null;
  for(let i = 0; i < sequence.length; i++){
    console.log("recorded " + sequence[i]);
    // for(let i = 0; i < step.length; i++){
    //   console.log("recorded " + step[i] + " at " + step);
    // }
  }
}

function getAudioBuffer(char){
  return soundBank[char].sample;
}

function playSample( char, time, recording) {
    const currentTime = audioContext.currentTime;
    const sampleSource = audioContext.createBufferSource();
    sampleSource.buffer = getAudioBuffer(char);
    sampleSource.connect(gainNode);
    sampleSource.start(time);
    console.log("recieved trigger event " + char + " at " + currentTime );
    console.log("started sample at " + audioContext.currentTime);
    if(recording){
      recordTrigger(currentTime, char);
    }
}


function recordTrigger(currentTime, char){
  let triggerTime = currentTime - startTime;
  let step = quantize(triggerTime);
  console.log("recording trigger " + char + " at " + step);
  if(sequence[step]){
    sequence[step].push(char);
    console.log( "pushed " + char + "to array at " + step)
  }else if(triggerTime >= 0){
    sequence[step] = [char];
    console.log("recorded " + char);
  }
  // if(triggerTime > 0){triggerList.push({char: char, step: quantize(triggerTime)})};
}

function quantize(time){
  const beatLength = 60.0/bpm;
  const beats = time/(beatLength * quantization);
  return Math.round(beats);
}

function getDuration(char){
  return getAudioBuffer(char).duration * 1000;
}

function getSampleName(char){
 return soundBank[char].name;
}

function setGain(vol){
  gainNode.gain.value = vol;
}

function scheduleClick(stepNumber, time){
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();

    osc.frequency.value = (stepNumber % (4/quantization) === 0) ? 1000 : 800;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    osc.connect(envelope);
    envelope.connect(audioContext.destination); 
    osc.start(time);
    osc.stop(time + 0.03);
}

function scheduleNote(step, time){
  if(sequence[step]){
    for(let i = 0; i < sequence[step].length; i++){
     playSample(sequence[step][i], time, false);
    }
  }
}

function nextStep() {
    console.log("scheduler advancing to next step")
    let secondsPerBeat = 60.0 / bpm;        
    nextNoteTime += secondsPerBeat * quantization;    // Add step length to last note time
    currentStep++;    // Advance the step number
    // if (currentStep === 4/quantization) {
    //     currentStep = 0;
    // }
    if(currentStep === (loopLengthInBars * 4) / quantization){
      console.log("reached step " + currentStep + " restarting loop");
      currentStep = 0;
      startTime = nextNoteTime;
    }

}


function scheduler(){
  let marker = audioContext.currentTime + scheduleAheadTime
  while (nextNoteTime < marker ) {
      scheduleNote(currentStep, nextNoteTime);
      if(metronome && currentStep % (1/quantization) == 0){
        scheduleClick( currentStep, nextNoteTime );
      }
      nextStep();
    }
    
    // const loopLengthInSeconds = beatLength * 4 * loopLengthInBars;
    // const newLoopStart = startTime + loopLengthInSeconds  
}

function startClock(){
  currentStep = 0;
  nextNoteTime = startTime;
  clickIntervalID = setInterval(scheduler, lookahead);
  console.log("starting metronome");
}

function playLoop(){
  if(startTime === null){
    startTime = audioContext.currentTime;
  }
  
  startClock();
  // for(let i=0; i < triggerList.length; i++){
  //   const time = startTime + (triggerList[i].time * 60.0/bpm * quantization);
  //   playSample(triggerList[i].char, time , false);
  // }
}



function setBpm(newTempoInBpm){
  bpm = newTempoInBpm;
}

function getInstant(){
  return audioContext.currentTime;
}

function clearLoop(){
  sequence.length = 0;
}

function setLoopLength(lengthInBars){
  loopLengthInBars = lengthInBars;
}

export{setupSamples, prepAudio, playSample, getDuration, getSampleName, setGain, recordStart, stop, startClock, playLoop, setBpm, getInstant, clearLoop, setLoopLength};