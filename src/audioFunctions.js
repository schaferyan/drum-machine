// TODO fix problem with gainNode - possibly a scope issue

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const soundBank = {};

let gainNode;

let startTime = null;
let bpm = 120.0;
let quantization = 0.5;
const triggerList = [];

let currentBeat = 0;
let lookahead = 25.0;
let scheduleAheadTime = 0.1;
let nextClickTime = 0.0;
let clickIntervalID = null;;

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
  startMetronome();
  playLoop();
  console.log("record started at " + startTime)
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
  console.log("triggerList =");
  for(let i=0; i < triggerList.length; i++){
    console.log(triggerList[i].char + " pressed at " + triggerList[i].time);
  }
  // stop the metronome
  clearInterval(clickIntervalID);
  startTime = null;
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
  if(triggerTime > 0){triggerList.push({char: char, time: quantize(triggerTime)})};
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

function scheduleClick(beatNumber, time){
    const osc = audioContext.createOscillator();
    const envelope = audioContext.createGain();

    osc.frequency.value = (beatNumber % 4 === 0) ? 1000 : 800;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    osc.connect(envelope);
    envelope.connect(audioContext.destination); 
    osc.start(time);
    osc.stop(time + 0.03);
}

function nextBeat() {
    console.log("scheduler advancing to next beat")
    let secondsPerBeat = 60.0 / bpm;        
    nextClickTime += secondsPerBeat;    // Add beat length to last beat time
    currentBeat++;    // Advance the beat number, wrap to zero
    if (currentBeat === 4) {
        currentBeat = 0;
    }
}

function scheduler(){
  let loopExit = audioContext.currentTime + scheduleAheadTime
  while (nextClickTime < loopExit ) {
        scheduleClick( currentBeat, nextClickTime );
        nextBeat();
    }
    
}

function startMetronome(){
  currentBeat = 0;
  nextClickTime = audioContext.currentTime;
  clickIntervalID = setInterval(scheduler, lookahead);
  console.log("starting metronome");
}

function playLoop(){
  if(startTime === null){
    startTime = audioContext.currentTime;
  }
  for(let i=0; i < triggerList.length; i++){
    const time = startTime + (triggerList[i].time * 60.0/bpm * quantization);
    playSample(triggerList[i].char, time , false);
  }
}

function setBpm(newTempoInBpm){
  bpm = newTempoInBpm;
}

function getInstant(){
  return audioContext.currentTime;
}

export{setupSamples, prepAudio, playSample, getDuration, getSampleName, setGain, recordStart, stop, startMetronome, playLoop, setBpm, getInstant};