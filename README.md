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

The search starts at `startSize` (default: `320`). If the codec is not supported at that size, no ranges are searched. Smooth and power-efficient ranges are searched only when the corresponding property is true at `startSize`. The search assumes each qualifying range is continuous around the starting size. `minSize` and `maxSize` (defaults: `1` and `64000`) limit the search.

Size options must be positive safe integers with `minSize <= startSize <= maxSize`. Invalid options return a `RangeError` in `error` with `attempts: 0`. Browser probe failures also appear in `error`; `attempts` counts the distinct sizes probed. When `error` is set, the resolution ranges may be incomplete.

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
