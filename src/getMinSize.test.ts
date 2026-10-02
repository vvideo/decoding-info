import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { getMinSize } from './getMinSize';

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

function mockDecodingInfo(isSmooth: (size: number) => boolean) {
    const decodingInfo = jest.fn(async (request: MediaDecodingConfiguration) => {
        const size = request.video!.width;
        return {
            supported: true,
            smooth: isSmooth(size),
            powerEfficient: false,
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

describe('getMinSize', () => {
    it('returns the requested lower bound after one probe when it qualifies', async () => {
        const decodingInfo = mockDecodingInfo(() => true);

        const result = await getMinSize(configuration, info => info.smooth, 16);

        expect(result).toEqual({ result: 16, attempts: 1, minWidth: 16, minHeight: 16 });
        expect(decodingInfo).toHaveBeenCalledWith({
            ...configuration,
            video: { ...configuration.video!, width: 16, height: 16 },
        });
    });

    it('finds the first size accepted by the supplied predicate', async () => {
        const decodingInfo = mockDecodingInfo(size => size >= 48);

        const result = await getMinSize(configuration, info => info.supported && info.smooth, 1);

        expect(result.result).toBe(48);
        expect(result.minWidth).toBe(48);
        expect(result.minHeight).toBe(48);
        expect(result.attempts).toBe(decodingInfo.mock.calls.length);
        expect(decodingInfo.mock.calls.every(([request]) => request.video!.width === request.video!.height)).toBe(true);
    });

    it('reports no minimum when no size through the search limit qualifies', async () => {
        const decodingInfo = mockDecodingInfo(() => false);

        const result = await getMinSize(configuration, info => info.smooth, 1);

        expect(result).toEqual({
            result: null,
            attempts: decodingInfo.mock.calls.length,
            minWidth: undefined,
            minHeight: undefined,
        });
    });
});
