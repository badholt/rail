import './audio.html';

export const playFrequency = (duration, frequency) => {
    // create 2 second worth of audio buffer, with single channels and sampling rate of your device.
    const audio = new AudioContext(),
        sampleRate = audio.sampleRate,
        numChannels = 1,
        buffer = audio.createBuffer(numChannels, duration * sampleRate, sampleRate);
    // fill the channel with the desired frequency's data
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < sampleRate; i++) {
        channelData[i] = Math.sin(2 * Math.PI * frequency * i / (sampleRate));
    }

    // create audio source node.
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(audio.destination);

    // finally start to play
    source.start(0);
    return source;
};

Template.audioComponent.onRendered(function () {
    const data = this.data,
        audio = document.getElementById(data.file.name);

    if (audio) this.timedAudio(audio, data.delay, data.duration);
});

Template.audioComponent.onCreated(function () {
    this.timedAudio = (audio, delay, duration) => Meteor.setTimeout(() => {
        const promise = audio.play();
        promise.then(() => Meteor.setTimeout(() => audio.pause(), duration)).catch((error) => {
            console.log(error);
        });
    }, delay);

    /** TODO: Look into tone generation: */
    // const tone = playFrequency(2, 400);
});
