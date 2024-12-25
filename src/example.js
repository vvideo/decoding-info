import { findResolutionRestrictions } from './index.js';

const selectType = document.querySelector('#select-type');
const inputVideoContentType = document.querySelector('#input-video-content-type');
const inputVideoFramerate = document.querySelector('#input-video-framerate');
const inputVideoBitrate = document.querySelector('#input-video-bitrate');
const selectKeySystem = document.querySelector('#select-keysystem');
const inputRobustness = document.querySelector('#input-robustness');

const submit = document.querySelector('#submit');
const output = document.querySelector('#output');

submit.onclick = async () => {
    output.style.display = 'none';
    const data = await findResolutionRestrictions({
        type: selectType.value,
        video: {
            contentType: inputVideoContentType.value,
            framerate: parseInt(inputVideoFramerate.value, 10),
            bitrate: parseInt(inputVideoBitrate.value, 10),
        },
        keySystemConfiguration: selectKeySystem.value ? {
            keySystem: selectKeySystem.value,
            robustness: inputRobustness.value,
        } : undefined,
    }); 
    
    console.log('result', data);
    output.style.display = 'block';
    output.innerText = JSON.stringify(data, null, 4); 
}
