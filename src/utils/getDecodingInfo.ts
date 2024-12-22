export function getDecodingInfo(configuration: MediaDecodingConfiguration) {
    return navigator.mediaCapabilities.decodingInfo(configuration);
}
