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
    const result = MediaSource.isTypeSupported(mimeType);
    output.innerHTML = 'MediaSource.isTypeSupported(\'' + mimeType + '\') => <b style="color: ' + (result ? 'green' : 'red') + '">' + result + '</b>';
}

if (!window.MediaSource || !window.MediaSource.isTypeSupported) {
    error.innerText = 'MediaSource.isTypeSupported method is not supported in this browser.';
}
