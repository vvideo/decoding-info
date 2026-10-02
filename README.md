# Decoding Info

[![NPM version](https://img.shields.io/npm/v/decoding-info.svg)](https://www.npmjs.com/package/decoding-info)
[![NPM Downloads](https://img.shields.io/npm/dm/decoding-info.svg?style=flat)](https://www.npmjs.org/package/decoding-info)
[![install size](https://packagephobia.com/badge?p=decoding-info)](https://packagephobia.com/result?p=decoding-info)

[Demo](https://vvideo.github.io/decoding-info/index.html)

This npm package allows you to determine the resolution of a supported video codec using the [MediaCapabilities API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/mediaCapabilities).

Finding video codec resolution:
- Minimum and maximum square resolutions for a video codec.
- Minimum and maximum square resolutions with smooth playback.
- Minimum and maximum square resolutions the browser reports as power efficient.

Each probe sets both `video.width` and `video.height` to the same size. The search starts at `startSize` (default: `320`). If the codec is not supported at that size, no ranges are searched. Smooth and power-efficient ranges are searched only when the corresponding property is true at `startSize`. The search assumes each qualifying range is continuous around the starting size. `minSize` and `maxSize` (defaults: `1` and `64000`) limit the search.

The configuration must include `video`; audio-only configurations return a `TypeError` in `error` without probing. Size options must be positive safe integers with `minSize <= startSize <= maxSize`. Invalid options return a `RangeError` in `error` with `attempts: 0`. Browser probe failures also appear in `error`; `attempts` counts the distinct sizes probed. When `error` is set, the resolution ranges may be incomplete.

## Installation
```bash
npm install decoding-info
```

## Usage
```js
import { getVideoCodecSupportedResolution } from 'decoding-info';

const configuration = {
    type: 'file',
    video: {
        contentType: 'video/mp4; codecs="avc1.42E01E"',
        width: 320,
        height: 320,
        framerate: 25,
        bitrate: 1_000_000,
    },
};

getVideoCodecSupportedResolution(configuration, {
    minSize: 16,
    maxSize: 8192,
    startSize: 320,
}).then((result) => {
    console.log(result);
    // Example when all three qualities are available at both bounds:
    // {
    //     "error": null,
    //     "attempts": 3,
    //     "supported": {
    //         "value": true,
    //         "minWidth": 16,
    //         "minHeight": 16,
    //         "maxWidth": 8192,
    //         "maxHeight": 8192
    //     },
    //     "smooth": {
    //         "value": true,
    //         "minWidth": 16,
    //         "minHeight": 16,
    //         "maxWidth": 8192,
    //         "maxHeight": 8192
    //     },
    //     "powerEfficient": {
    //         "value": true,
    //         "minWidth": 16,
    //         "minHeight": 16,
    //         "maxWidth": 8192,
    //         "maxHeight": 8192
    //     }
    // }
});
```

Each quality has a `value` flag and minimum and maximum width and height fields. Boundaries are `undefined` when that quality has no range around `startSize`. The browser determines whether decoding is smooth or power efficient; power efficiency does not necessarily mean hardware acceleration.

## Development

Install dependencies and run the unit tests, type check, and build:

```bash
npm ci
npm test
```

Run `npm run build` to rebuild `dist` and copy the ESM bundle to `pages/index.esm.js` for the demo.

## Release

Update the version in `package.json` and `package-lock.json`, add a CHANGELOG entry, and run `npm test`. Publishing a GitHub release triggers the npm workflow, which runs the tests before publishing. Use a `v<version>` release tag; prereleases go to npm's `next` tag and regular releases to `latest`.

## Links
- [Demo](https://vvideo.github.io/decoding-info/index.html)
- [Test navigator.mediaCapabilities.decodingInfo()](https://vvideo.github.io/decoding-info/decoding-info.html)
- [Test MediaSource.isTypeSupported()](https://vvideo.github.io/decoding-info/is-type-supported.html)
- [Test .canPlayType()](https://vvideo.github.io/decoding-info/can-play-type.html)

## [License](./LICENSE)
MIT
