async function getFile(audioContext, filepath) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

async function setupSamples(audioContext, samples, keyset) {
	const soundBank = {};
	for (let i = 0; i < keyset.length; i++){
		const filePath = samples[i].src;
		const sample = await getFile(audioContext, filePath);
		soundBank[keyset[i]] = {name: samples[i].name, sample: sample};
	} 
  return soundBank;
}

//TODO add gain node
function playSample(audioContext, audioBuffer, time, vol) {
    const sampleSource = audioContext.createBufferSource();
    sampleSource.buffer = audioBuffer;
    const duration = audioBuffer.duration;
    const gainNode = audioContext.createGain();
    sampleSource.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = vol;
    sampleSource.start(time);
    return sampleSource;
}

export{setupSamples, playSample};