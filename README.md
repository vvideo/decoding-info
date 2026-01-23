# Decoding Info

[![NPM version](https://img.shields.io/npm/v/decoding-info.svg)](https://www.npmjs.com/package/decoding-info)
[![NPM Downloads](https://img.shields.io/npm/dm/decoding-info.svg?style=flat)](https://www.npmjs.org/package/decoding-info)
[![install size](https://packagephobia.com/badge?p=decoding-info)](https://packagephobia.com/result?p=decoding-info)

[Demo](https://vvideo.github.io/decoding-info/index.html)

This npm package allows you to determine the resolution of a supported video codec using the [MediaCapabilities API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/mediaCapabilities).

Finding video codec resolution:
- Minimum and maximum resolutions for a video codec.
- Minimum and maximum resolutions for a video codec with smooth playback.
- Minimum and maximum resolutions for a video codec in power-efficiency mode (similar to hardware acceleration).

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
        framerate: 25,
        bitrate: 1000000,
    },
};

getVideoCodecSupportedResolution(configuration).then((result) => {
    console.log(result);
    // {
    //     "error": null,
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
- [Demo](https://vvideo.github.io/decoding-info/index.html)
- [Test navigator.mediaCapabilities.decodingInfo()](https://vvideo.github.io/decoding-info/decoding-info.html)
- [Test MediaSource.isTypeSupported()](https://vvideo.github.io/decoding-info/is-type-supported.html)
- [Test .canPlayType()](https://vvideo.github.io/decoding-info/can-play-type.html)

## [License](./LICENSE)
MIT
