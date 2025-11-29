import { START_SIZE } from './consts';
import { binarySearch  } from './utils/binarySearch';
import { getDecodingInfo } from './utils/getDecodingInfo';

export async function getMaxSize(configuration: MediaDecodingConfiguration, getSupported: (result: MediaCapabilitiesDecodingInfo) => boolean, maxSize: number) {
    let maxWidth: undefined | number = undefined;
    let attempts = 1;

    const dataMaxSize = await getDecodingInfo({
        ...configuration,
        video: {
            ...configuration.video!,
            width: maxSize,
            height: maxSize,
        }
    });

    const supportedMaxSize = getSupported(dataMaxSize);
    if (supportedMaxSize) {
        return {
            result: maxSize,
            attempts,
            maxWidth: maxSize,
            maxHeight: maxSize,
        };
    }

    const result = await binarySearch(async (value) => {
        attempts++;
        const data1 = await getDecodingInfo({
            ...configuration,
            video: {
                ...configuration.video!,
                width: value,
                height: value,
            }
        });

        const supported1 = getSupported(data1);
        if (!supported1) {
            return 1;
        }

        if (supported1) {
            maxWidth = Math.max(maxWidth || 0, value);
        }

        attempts++;
        const data2 = await getDecodingInfo({
            ...configuration,
            video: {
                ...configuration.video!,
                width: value + 1,
                height: value + 1,
            }
        });

        const supported2 = getSupported(data2);
        if (supported2) {
            maxWidth = Math.max(maxWidth || 0, value + 1);
        }

        if (supported1 !== supported2) {
            return 0;
        }

        if (supported1 && supported2) {
            return -1;
        }

        return 1;
    }, START_SIZE, maxSize);

    return {
        attempts,
        maxWidth,
        maxHeight: maxWidth,
        result,
    };
}
