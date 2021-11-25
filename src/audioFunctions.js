// TODO fix problem with gainNode - possibly a scope issue

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const soundBank = {};
let gainNode;

window.addEventListener("mousemove", function() {
  audioContext.resume();
}, {once : true});

window.addEventListener("keydown", function() {
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

function getAudioBuffer(char){
  return soundBank[char].sample;
}

function playSample( char, time, vol) {
    const sampleSource = audioContext.createBufferSource();
    sampleSource.buffer = getAudioBuffer(char);
    // gainNode.gain.value = vol;
    sampleSource.connect(gainNode);
    sampleSource.start(time);
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

export{setupSamples, prepAudio, playSample, getDuration, getSampleName, setGain};