import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { getDecodingInfo } from './getDecodingInfo';

const originalMediaCapabilities = Object.getOwnPropertyDescriptor(navigator, 'mediaCapabilities');

afterEach(() => {
    if (originalMediaCapabilities) {
        Object.defineProperty(navigator, 'mediaCapabilities', originalMediaCapabilities);
    } else {
        Reflect.deleteProperty(navigator, 'mediaCapabilities');
    }
});

describe('getDecodingInfo', () => {
    it('passes the configuration to the browser API and returns its result', async () => {
        const configuration: MediaDecodingConfiguration = {
            type: 'file',
            video: {
                contentType: 'video/mp4',
                width: 320,
                height: 320,
                bitrate: 1_000_000,
                framerate: 30,
            },
        };
        const browserResult = {
            supported: true,
            smooth: false,
            powerEfficient: false,
        } as MediaCapabilitiesDecodingInfo;
        const decodingInfo = jest.fn(async (_request: MediaDecodingConfiguration) => browserResult);
        Object.defineProperty(navigator, 'mediaCapabilities', {
            configurable: true,
            value: { decodingInfo },
        });

        await expect(getDecodingInfo(configuration)).resolves.toBe(browserResult);
        expect(decodingInfo).toHaveBeenCalledTimes(1);
        expect(decodingInfo).toHaveBeenCalledWith(configuration);
    });
});
