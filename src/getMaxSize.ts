import { START_SIZE } from './consts';
import { getDecodingInfo } from './utils/getDecodingInfo';

export async function getMaxSize(
    configuration: MediaDecodingConfiguration,
    getSupported: (result: MediaCapabilitiesDecodingInfo) => boolean,
    maxSize: number,
    startSize = START_SIZE,
    getInfo = (size: number) => getDecodingInfo({
        ...configuration,
        video: { ...configuration.video!, width: size, height: size },
    }),
) {
    let attempts = 0;
    const probe = async (size: number) => {
        attempts++;
        return getSupported(await getInfo(size));
    };

    if (!await probe(startSize) || startSize > maxSize) {
        return { attempts, maxWidth: undefined, maxHeight: undefined, result: null };
    }

    if (startSize === maxSize || await probe(maxSize)) {
        return { attempts, maxWidth: maxSize, maxHeight: maxSize, result: maxSize };
    }

    let left = startSize;
    let right = maxSize;
    while (right - left > 1) {
        const middle = Math.floor((left + right) / 2);
        if (await probe(middle)) {
            left = middle;
        } else {
            right = middle;
        }
    }

    return { attempts, maxWidth: left, maxHeight: left, result: left };
}
