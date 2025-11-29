const selectType = document.querySelector('#select-type');
const inputVideoContentType = document.querySelector('#input-video-content-type');
const inputVideoFramerate = document.querySelector('#input-video-framerate');
const inputVideoBitrate = document.querySelector('#input-video-bitrate');
const inputVideoWidth = document.querySelector('#input-video-width');
const inputVideoHeight = document.querySelector('#input-video-height');
const fieldsetVideo = document.querySelector('#fieldset-video');
const checkboxVideoHasAlphaChannel = document.querySelector('#checkbox-video-has-alpha-channel');
const selectVideoTransferFunction = document.querySelector('#select-video-transfer-function');
const selectVideoColorGamut = document.querySelector('#select-video-color-gamut');
const selectVideoHdrMetadataType = document.querySelector('#select-video-hdr-metadata-type');
const inputVideoScalabilityMode = document.querySelector('#input-video-scalability-mode');
const checkboxSpatialScalability = document.querySelector('#checkbox-spatial-scalability');
const fieldsetKeySystemConfigurationVideo = document.querySelector('#fieldset-key-system-configuration-video');
const inputVideoContentTypeReset = document.querySelector('#input-video-content-type-reset');
inputVideoContentTypeReset.onclick = () => {
    inputVideoContentType.value = '';
    inputVideoContentType.focus();
};
const checkboxVideo = document.querySelector('#input-video');
checkboxVideo.onclick = () => {
    fieldsetVideo.classList.toggle('disabled', !checkboxVideo.checked);
    fieldsetKeySystemConfigurationVideo.classList.toggle('disabled', !checkboxVideo.checked);
};

const inputAudioContentType = document.querySelector('#input-audio-content-type');
const inputAudioBitrate = document.querySelector('#input-audio-bitrate');
const inputAudioChannels = document.querySelector('#input-audio-channels');
const inputAudioSamplerate = document.querySelector('#input-audio-samplerate');
const checkboxAudioSpatialRendering = document.querySelector('#checkbox-audio-spatial-rendering');
const fieldsetAudio = document.querySelector('#fieldset-audio');
const fieldsetKeySystemConfigurationAudio = document.querySelector('#fieldset-key-system-configuration-audio');
const inputAudioContentTypeReset = document.querySelector('#input-audio-content-type-reset');
inputAudioContentTypeReset.onclick = () => {
    inputAudioContentType.value = '';
    inputAudioContentType.focus();
};
const checkboxAudio = document.querySelector('#input-audio');
checkboxAudio.onclick = () => {
    fieldsetAudio.classList.toggle('disabled', !checkboxAudio.checked);
    fieldsetKeySystemConfigurationAudio.classList.toggle('disabled', !checkboxAudio.checked);
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
const checkboxKeySystemConfiguration = document.querySelector('#input-key-system-configuration');
const fieldsetKeySystemConfiguration = document.querySelector('#fieldset-key-system-configuration');

checkboxKeySystemConfiguration.onclick = () => {
    fieldsetKeySystemConfiguration.classList.toggle('disabled', !checkboxKeySystemConfiguration.checked);
};

const submit = document.querySelector('#submit');
const output = document.querySelector('#output');
const input = document.querySelector('#input');
const error = document.querySelector('#error');
const status = document.querySelector('#status');

if (!navigator.mediaCapabilities || !navigator.mediaCapabilities.decodingInfo) {
    error.innerText = 'navigator.mediaCapabilities.decodingInfo method is not supported in this browser.';
}

submit.onclick = () => {
    output.style.display = 'none';
    error.style.display = 'none';

    const params = {
        type: selectType.value,
        audio: checkboxAudio.checked ? {
            contentType: inputAudioContentType.value,
            bitrate: inputAudioBitrate.value.trim() ? parseInt(inputAudioBitrate.value, 10) : undefined,
            channels: inputAudioChannels.value.trim() ? inputAudioChannels.value : undefined,
            samplerate: inputAudioSamplerate.value.trim() ? parseInt(inputAudioSamplerate.value, 10) : undefined,
            spatialRendering: checkboxAudioSpatialRendering.checked || undefined,
        } : undefined,
        video: checkboxVideo.checked ? {
            contentType: inputVideoContentType.value.trim(),
            framerate: parseInt(inputVideoFramerate.value, 10),
            bitrate: parseInt(inputVideoBitrate.value, 10),
            width: parseInt(inputVideoWidth.value, 10),
            height: parseInt(inputVideoHeight.value, 10),
            hasAlphaChannel: checkboxVideoHasAlphaChannel.checked || undefined,
            hdrMetadataType: selectVideoHdrMetadataType.value || undefined,
            transferFunction: selectVideoTransferFunction.value || undefined,
            colorGamut: selectVideoColorGamut.value || undefined,
            scalabilityMode: inputVideoScalabilityMode.value.trim() || undefined,
            spatialScalability: checkboxSpatialScalability.checked || undefined,
        } : undefined,
        keySystemConfiguration: checkboxKeySystemConfiguration.checked ? {
            keySystem: selectKeySystem.value,
            initDataType: inputInitDataType.value || undefined,
            sessionTypes: selectSessionTypes.value ? [selectSessionTypes.value] : undefined,
            distinctiveIdentifier: selectDistinctiveIdentifier.value || undefined,
            persistentState: selectPersistentState.value || undefined,
            video: checkboxVideo.checked && (inputVideoEncryptionScheme.value || inputVideoRobustness.value) ? {
                encryptionScheme: inputVideoEncryptionScheme.value || null,
                robustness: inputVideoRobustness.value,
            } : undefined,
            audio: checkboxAudio.checked && (inputAudioEncryptionScheme.value || inputAudioRobustness.value) ? {
                encryptionScheme: inputAudioEncryptionScheme.value || null,
                robustness: inputAudioRobustness.value,
            } : undefined,
        } : undefined,
    };

    console.info('Parameters', params);

    input.style.display = 'block';
    input.innerText = JSON.stringify(params, null, 4); 
    status.innerText = '';

    navigator.mediaCapabilities.decodingInfo(params).then(result => {
        console.info('Result', result);
        status.innerHTML = (result.supported ? '✅' : '❌') + (result.powerEfficient ? ' <span title="Power efficiency">🔋</span>' : '') + (result.smooth ? ' <span title="Smooth">🌿</span>' : '');
        output.style.display = 'block';
        output.innerText = JSON.stringify(result, null, 4); 
    }).catch(e => {
        console.error(e);
        status.innerText = '❌';
        error.style.display = 'block';
        error.innerText = `${e.name}: ${e.message}`;
    });
}
