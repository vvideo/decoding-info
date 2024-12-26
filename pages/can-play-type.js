const inputMimeType = document.querySelector('#input-mime-type');
const inputMimeTypeReset = document.querySelector('#input-mime-type-reset');

const submit = document.querySelector('#submit');
const output = document.querySelector('#output');
const error = document.querySelector('#error');

inputMimeTypeReset.onclick = () => {
    output.innerText = '';
    inputMimeType.value = '';
    inputMimeType.focus();
};

submit.onclick = () => {
    output.style.display = 'block';

    const mimeType = inputMimeType.value.trim();
    const result = document.createElement('video').canPlayType(mimeType);
    output.innerHTML = 'videoElement.canPlayType(\'' + mimeType + '\') => <b style="color: ' + (result ? 'green' : 'red') + '">' + (result || '""') + '</b>';
}
