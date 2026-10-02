import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { getMaxSize } from './getMaxSize';

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

function mockDecodingInfo(isPowerEfficient: (size: number) => boolean) {
    const decodingInfo = jest.fn(async (request: MediaDecodingConfiguration) => {
        const size = request.video!.width;
        return {
            supported: true,
            smooth: true,
            powerEfficient: isPowerEfficient(size),
        } as MediaCapabilitiesDecodingInfo;
    });
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

describe('getMaxSize', () => {
    it('returns the requested upper bound after one probe when it qualifies', async () => {
        const decodingInfo = mockDecodingInfo(() => true);

        const result = await getMaxSize(configuration, info => info.powerEfficient, 2000);

        expect(result).toEqual({ result: 2000, attempts: 1, maxWidth: 2000, maxHeight: 2000 });
        expect(decodingInfo).toHaveBeenCalledWith({
            ...configuration,
            video: { ...configuration.video!, width: 2000, height: 2000 },
        });
    });

    it('finds the last size accepted by the supplied predicate', async () => {
        const decodingInfo = mockDecodingInfo(size => size <= 1234);

        const result = await getMaxSize(configuration, info => info.supported && info.powerEfficient, 2000);

        expect(result.result).toBe(1234);
        expect(result.maxWidth).toBe(1234);
        expect(result.maxHeight).toBe(1234);
        expect(result.attempts).toBe(decodingInfo.mock.calls.length);
        expect(decodingInfo.mock.calls.every(([request]) => request.video!.width === request.video!.height)).toBe(true);
    });

    it('reports no maximum when no size from the search start qualifies', async () => {
        const decodingInfo = mockDecodingInfo(() => false);

        const result = await getMaxSize(configuration, info => info.powerEfficient, 2000);

        expect(result).toEqual({
            result: null,
            attempts: decodingInfo.mock.calls.length,
            maxWidth: undefined,
            maxHeight: undefined,
        });
    });
});
