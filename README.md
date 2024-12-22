# Decoding Info

[![NPM version](https://img.shields.io/npm/v/decoding-info.svg)](https://www.npmjs.com/package/decoding-info)
[![NPM Downloads](https://img.shields.io/npm/dm/decoding-info.svg?style=flat)](https://www.npmjs.org/package/decoding-info)
[![install size](https://packagephobia.com/badge?p=decoding-info)](https://packagephobia.com/result?p=decoding-info)

This npm package allows you to determine the resolution of a supported video codec using the [MediaCapabilities API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/mediaCapabilities).

## Installation
```bash
npm install --save-dev decoding-info
```

## Usage
```js
import { getVideoCodecSupportedResolution } from 'decoding-info';

const configuration = {
    video: {
        codec: 'video/mp4; codecs="hvc1.1.6.L123.B0"',
        width: 1920,
        height: 1080,
        framerate: 25,
        bitrate: 1000000,
    },
};

getVideoCodecSupportedResolution(configuration).then((result) => {
    console.log(result);
    // {
    //     "error": null,
    //     "attempts": 103,
    //     "supported": {
    //         "value": true,
    //         "minHeight": 16,
    //         "minWidth": 16,
    //         "maxWidth": 8192,
    //         "maxHeight": 8192
    //     },
    //     "smooth": {
    //         "value": true,
    //         "minHeight": 16,
    //         "minWidth": 16,
    //         "maxWidth": 8192,
    //         "maxHeight": 8192
    //     },
    //     "powerEfficient": {
    //         "value": true,
    //         "minHeight": 16,
    //         "minWidth": 16,
    //         "maxWidth": 8192,
    //         "maxHeight": 8192
    //     }
    // }
});
```

## Links
- [Test navigator.mediaCapabilities.decodingInfo()](https://vvideo.github.io/decoding-info/pages/decoding-info.html)
- [Test MediaSource.isTypeSupported()](https://vvideo.github.io/decoding-info/pages/is-type-supported.html)
- [Test .canPlayType()](https://vvideo.github.io/decoding-info/pages/can-play-type.html)

## [License](./LICENSE)
MIT
