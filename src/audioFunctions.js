
export function createGainNode(audioContext){
  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  return gainNode;
}

 export async function getFile(audioContext, filepath) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

 export async function setupSamples( audioContext, samples, keyset) {
  const soundBank = {};	
	for (let i = 0; i < keyset.length; i++){
		const filePath = samples[i].src;
		const sample = await getFile( audioContext, filePath);
		soundBank[keyset[i]] = {name: samples[i].name, sample: sample};
  }
  return soundBank;
}



export function countOff(audioContext, countStart, beatLength, quantization){
  for(let i=0; i< 4; i++){
    scheduleClick(audioContext, 0, countStart + i * beatLength, quantization);
  }; 
}

export function playSample(audioContext, char, soundBank, node, time) {
    const currentTime = audioContext.currentTime;
    const sampleSource = audioContext.createBufferSource();
    sampleSource.buffer = soundBank[char].sample;
    const duration = sampleSource.buffer.duration;
    sampleSource.connect(node);
    sampleSource.start(time);
    console.log("recieved trigger event " + char + " at " + currentTime );
    console.log("started sample at " + audioContext.currentTime);
    return duration;
}




export function scheduleClick(audioContext, stepNumber, time, quantization){
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

export function scheduleNote(audioContext, soundBank, node, time, sequence, step){
  if(sequence[step]){
    for(let i = 0; i < sequence[step].length; i++){
     playSample(audioContext, sequence[step][i], soundBank, node, time);
    }
  }
}

