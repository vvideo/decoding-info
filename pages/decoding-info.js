const selectType = document.querySelector('#select-type');
const inputVideoContentType = document.querySelector('#input-video-content-type');
const inputVideoFramerate = document.querySelector('#input-video-framerate');
const inputVideoBitrate = document.querySelector('#input-video-bitrate');
const inputVideoWidth = document.querySelector('#input-video-width');
const inputVideoHeight = document.querySelector('#input-video-height');
const fieldsetVideo = document.querySelector('#fieldset-video');
const fieldsetKeySystemConfigurationVideo = document.querySelector('#fieldset-key-system-configuration-video');
const inputVideoContentTypeReset = document.querySelector('#input-video-content-type-reset');
inputVideoContentTypeReset.onclick = () => {
    inputVideoContentType.value = '';
    inputVideoContentType.focus();
};
const inputVideo = document.querySelector('#input-video');
inputVideo.onclick = () => {
    fieldsetVideo.classList.toggle('disabled', !inputVideo.checked);
    fieldsetKeySystemConfigurationVideo.classList.toggle('disabled', !inputVideo.checked);
};

const inputAudioContentType = document.querySelector('#input-audio-content-type');
const inputAudioBitrate = document.querySelector('#input-audio-bitrate');
const inputAudioChannels = document.querySelector('#input-audio-channels');
const inputAudioSamplerate = document.querySelector('#input-audio-samplerate');
const fieldsetAudio = document.querySelector('#fieldset-audio');
const fieldsetKeySystemConfigurationAudio = document.querySelector('#fieldset-key-system-configuration-audio');
const inputAudioContentTypeReset = document.querySelector('#input-audio-content-type-reset');
inputAudioContentTypeReset.onclick = () => {
    inputAudioContentType.value = '';
    inputAudioContentType.focus();
};
const inputAudio = document.querySelector('#input-audio');
inputAudio.onclick = () => {
    fieldsetAudio.classList.toggle('disabled', !inputAudio.checked);
    fieldsetKeySystemConfigurationAudio.classList.toggle('disabled', !inputAudio.checked);
};

const selectKeySystem = document.querySelector('#select-keysystem');
const inputInitDataType = document.querySelector('#input-init-data-type');
const inputVideoRobustness = document.querySelector('#input-video-robustness');
const inputAudioRobustness = document.querySelector('#input-audio-robustness');
const inputVideoEncryptionScheme = document.querySelector('#input-video-encryption-scheme');
const inputAudioEncryptionScheme = document.querySelector('#input-audio-encryption-scheme');
const selectSessionTypes = document.querySelector('#select-session-types');
const selectPersistentState = document.querySelector('#select-persistent-state');
const selectDistinctiveIdentifier = document.querySelector('#select-distinctive-indentifier');
const inputKeySystemConfiguration = document.querySelector('#input-key-system-configuration');
const fieldsetKeySystemConfiguration = document.querySelector('#fieldset-key-system-configuration');

inputKeySystemConfiguration.onclick = () => {
    fieldsetKeySystemConfiguration.classList.toggle('disabled', !inputKeySystemConfiguration.checked);
};

const submit = document.querySelector('#submit');
const output = document.querySelector('#output');
const error = document.querySelector('#error');

if (!navigator.mediaCapabilities || !navigator.mediaCapabilities.decodingInfo) {
    error.innerText = 'navigator.mediaCapabilities.decodingInfo method is not supported in this browser.';
}

submit.onclick = () => {
    output.style.display = 'none';
    error.style.display = 'none';

    const params = {
        type: selectType.value,
        audio: inputAudio.checked ? {
            contentType: inputAudioContentType.value,
            bitrate: parseInt(inputAudioBitrate.value, 10),
            channels: parseInt(inputAudioChannels.value, 10),
            samplerate: parseInt(inputAudioSamplerate.value, 10),
        } : undefined,
        video: inputVideo.checked ? {
            contentType: inputVideoContentType.value,
            framerate: parseInt(inputVideoFramerate.value, 10),
            bitrate: parseInt(inputVideoBitrate.value, 10),
            width: parseInt(inputVideoWidth.value, 10),
            height: parseInt(inputVideoHeight.value, 10),
        } : undefined,
        keySystemConfiguration: inputKeySystemConfiguration.checked ? {
            keySystem: selectKeySystem.value,
            initDataType: inputInitDataType.value || undefined,
            sessionTypes: selectSessionTypes.value ? [selectSessionTypes.value] : undefined,
            distinctiveIdentifier: selectDistinctiveIdentifier.value || undefined,
            persistentState: selectPersistentState.value || undefined,
            video: inputVideo.checked && (inputVideoEncryptionScheme.value || inputVideoRobustness.value) ? {
                encryptionScheme: inputVideoEncryptionScheme.value || null,
                robustness: inputVideoRobustness.value,
            } : undefined,
            audio: inputAudio.checked && (inputAudioEncryptionScheme.value || inputAudioRobustness.value) ? {
                encryptionScheme: inputAudioEncryptionScheme.value || null,
                robustness: inputAudioRobustness.value,
            } : undefined,
        } : undefined,
    };

    console.info('Params', params);

    navigator.mediaCapabilities.decodingInfo(params).then(result => {
        console.info('Result', result);
        output.style.display = 'block';
        output.innerText = JSON.stringify(result, null, 4); 
    }).catch(e => {
        console.error(e);
        error.style.display = 'block';
        error.innerText = `${e.name}: ${e.message}`;
    });
}
