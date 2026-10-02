import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { getVideoCodecSupportedResolution } from './index';

const configuration: MediaDecodingConfiguration = {
    type: 'file',
    video: {
        contentType: 'video/mp4; codecs="avc1.42E01E"',
        width: 1920,
        height: 1080,
        bitrate: 1_000_000,
        framerate: 30,
    },
};

const originalMediaCapabilities = Object.getOwnPropertyDescriptor(navigator, 'mediaCapabilities');

function mockDecodingInfo(implementation: (request: MediaDecodingConfiguration) => Promise<MediaCapabilitiesDecodingInfo>) {
    const decodingInfo = jest.fn(implementation);
    Object.defineProperty(navigator, 'mediaCapabilities', {
        configurable: true,
        value: { decodingInfo },
    });
    return decodingInfo;
}

afterEach(() => {
    if (originalMediaCapabilities) {
        Object.defineProperty(navigator, 'mediaCapabilities', originalMediaCapabilities);
    } else {
        Reflect.deleteProperty(navigator, 'mediaCapabilities');
    }
});

describe('getVideoCodecSupportedResolution', () => {
    it('rejects invalid resolution bounds before probing', async () => {
        const decodingInfo = mockDecodingInfo(async () => ({
            supported: false,
            smooth: false,
            powerEfficient: false,
        } as MediaCapabilitiesDecodingInfo));

        for (const options of [
            { minSize: 0 },
            { maxSize: 1.5 },
            { startSize: Infinity },
            { minSize: 500, maxSize: 400 },
            { minSize: 400, maxSize: 800, startSize: 320 },
        ]) {
            const result = await getVideoCodecSupportedResolution(configuration, options);
            expect(result.error).toBeInstanceOf(RangeError);
            expect(result.attempts).toBe(0);
            expect(result.supported.value).toBe(false);
        }
        expect(decodingInfo).not.toHaveBeenCalled();
    });

    it('returns a search error with the completed probe count', async () => {
        const error = new Error('search probe failed');
        const decodingInfo = mockDecodingInfo(async request => {
            if (request.video!.width === 1) {
                throw error;
            }
            return {
                supported: true,
                smooth: false,
                powerEfficient: false,
            } as MediaCapabilitiesDecodingInfo;
        });

        const result = await getVideoCodecSupportedResolution(configuration, {
            minSize: 1,
            maxSize: 1000,
            startSize: 320,
        });

        expect(result.error).toBe(error);
        expect(result.attempts).toBe(decodingInfo.mock.calls.length);
        expect(result.supported.minWidth).toBeUndefined();
        expect(result.supported.maxWidth).toBeUndefined();
    });

    it('returns an empty result after an unsupported starting probe', async () => {
        const decodingInfo = mockDecodingInfo(async () => ({
            supported: false,
            smooth: false,
            powerEfficient: false,
        } as MediaCapabilitiesDecodingInfo));

        const result = await getVideoCodecSupportedResolution(configuration, { startSize: 256 });

        expect(result).toEqual({
            error: null,
            attempts: 1,
            supported: { value: false, minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
            smooth: { value: false, minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
            powerEfficient: { value: false, minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
        });
        expect(decodingInfo).toHaveBeenCalledTimes(1);
        expect(decodingInfo).toHaveBeenCalledWith({
            ...configuration,
            video: { ...configuration.video!, width: 256, height: 256 },
        });
    });

    it('returns the initial decoding error without further probes', async () => {
        const error = new Error('decodingInfo failed');
        const decodingInfo = mockDecodingInfo(async () => { throw error; });

        const result = await getVideoCodecSupportedResolution(configuration);

        expect(result.error).toBe(error);
        expect(result.attempts).toBe(1);
        expect(result.supported.value).toBe(false);
        expect(result.smooth.value).toBe(false);
        expect(result.powerEfficient.value).toBe(false);
        expect(decodingInfo).toHaveBeenCalledTimes(1);
    });

    it('normalizes a non-Error rejection from the browser API', async () => {
        mockDecodingInfo(async () => { throw 'decodingInfo failed'; });

        const result = await getVideoCodecSupportedResolution(configuration);

        expect(result.error).toBeInstanceOf(Error);
        expect(result.error?.message).toBe('decodingInfo failed');
        expect(result.attempts).toBe(1);
    });

    it('finds independent supported, smooth, and power-efficient ranges', async () => {
        const decodingInfo = mockDecodingInfo(async request => {
            const size = request.video!.width;
            const supported = size >= 16 && size <= 4096;
            return {
                supported,
                smooth: supported && size >= 32 && size <= 2048,
                powerEfficient: supported && size >= 64 && size <= 1024,
            } as MediaCapabilitiesDecodingInfo;
        });

        const result = await getVideoCodecSupportedResolution(configuration, {
            minSize: 1,
            maxSize: 5000,
            startSize: 320,
        });

        expect(result).toEqual({
            error: null,
            attempts: decodingInfo.mock.calls.length,
            supported: { value: true, minWidth: 16, minHeight: 16, maxWidth: 4096, maxHeight: 4096 },
            smooth: { value: true, minWidth: 32, minHeight: 32, maxWidth: 2048, maxHeight: 2048 },
            powerEfficient: { value: true, minWidth: 64, minHeight: 64, maxWidth: 1024, maxHeight: 1024 },
        });
        expect(decodingInfo.mock.calls[0][0]).toEqual({
            ...configuration,
            video: { ...configuration.video!, width: 320, height: 320 },
        });
        expect(decodingInfo.mock.calls.every(([request]) =>
            request.type === configuration.type &&
            request.video!.contentType === configuration.video!.contentType &&
            request.video!.bitrate === configuration.video!.bitrate &&
            request.video!.framerate === configuration.video!.framerate &&
            request.video!.width === request.video!.height
        )).toBe(true);
        expect(configuration.video).toEqual({
            contentType: 'video/mp4; codecs="avc1.42E01E"',
            width: 1920,
            height: 1080,
            bitrate: 1_000_000,
            framerate: 30,
        });
        const requestedSizes = decodingInfo.mock.calls.map(([request]) => request.video!.width);
        expect(new Set(requestedSizes).size).toBe(requestedSizes.length);
        expect(requestedSizes.length).toBeLessThanOrEqual(54);
    });

    it('honors resolution bounds while leaving unavailable playback qualities empty', async () => {
        const decodingInfo = mockDecodingInfo(async () => ({
            supported: true,
            smooth: false,
            powerEfficient: false,
        } as MediaCapabilitiesDecodingInfo));

        const result = await getVideoCodecSupportedResolution(configuration, {
            minSize: 48,
            maxSize: 900,
            startSize: 600,
        });

        expect(result).toEqual({
            error: null,
            attempts: decodingInfo.mock.calls.length,
            supported: { value: true, minWidth: 48, minHeight: 48, maxWidth: 900, maxHeight: 900 },
            smooth: { value: false, minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
            powerEfficient: { value: false, minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
        });
        expect(decodingInfo.mock.calls[0][0].video).toEqual({
            ...configuration.video!,
            width: 600,
            height: 600,
        });
    });

    it('does not search qualities that fail at the starting size', async () => {
        const decodingInfo = mockDecodingInfo(async request => {
            const size = request.video!.width;
            const supported = size >= 16 && size <= 1024;
            return {
                supported,
                smooth: supported && size <= 100,
                powerEfficient: supported && size >= 900,
            } as MediaCapabilitiesDecodingInfo;
        });

        const result = await getVideoCodecSupportedResolution(configuration, {
            minSize: 16,
            maxSize: 1024,
            startSize: 320,
        });

        expect(result.supported).toEqual({
            value: true,
            minWidth: 16,
            minHeight: 16,
            maxWidth: 1024,
            maxHeight: 1024,
        });
        expect(result.smooth).toEqual({
            value: false,
            minWidth: undefined,
            minHeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        });
        expect(result.powerEfficient).toEqual({
            value: false,
            minWidth: undefined,
            minHeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        });
        expect(decodingInfo).toHaveBeenCalledTimes(3);
    });

    it('uses a custom starting size as the anchor for the minimum search', async () => {
        const decodingInfo = mockDecodingInfo(async request => {
            const size = request.video!.width;
            const supported = size >= 400 && size <= 1200;
            return {
                supported,
                smooth: supported,
                powerEfficient: supported,
            } as MediaCapabilitiesDecodingInfo;
        });

        const result = await getVideoCodecSupportedResolution(configuration, {
            minSize: 1,
            maxSize: 2000,
            startSize: 600,
        });

        expect(result.supported.minWidth).toBe(400);
        expect(result.supported.maxWidth).toBe(1200);
        expect(result.smooth.minWidth).toBe(400);
        expect(result.powerEfficient.minWidth).toBe(400);
        expect(decodingInfo.mock.calls.every(([request]) => {
            const size = request.video!.width;
            return size >= 1 && size <= 2000;
        })).toBe(true);
    });
});
