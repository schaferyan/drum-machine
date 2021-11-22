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

function playSample(audioContext, audioBuffer, time) {
    const sampleSource = audioContext.createBufferSource();
    sampleSource.buffer = audioBuffer;
    sampleSource.connect(audioContext.destination)
    sampleSource.start(time);
    return sampleSource;
}

export{setupSamples, playSample};