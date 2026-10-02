import { START_SIZE } from './consts';
import { getDecodingInfo } from './utils/getDecodingInfo';

export async function getMinSize(
    configuration: MediaDecodingConfiguration,
    getSupported: (result: MediaCapabilitiesDecodingInfo) => boolean,
    minSize: number,
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

    if (!await probe(startSize) || startSize < minSize) {
        return { attempts, minWidth: undefined, minHeight: undefined, result: null };
    }

    if (startSize === minSize || await probe(minSize)) {
        return { attempts, minWidth: minSize, minHeight: minSize, result: minSize };
    }

    let left = minSize;
    let right = startSize;
    while (right - left > 1) {
        const middle = Math.floor((left + right) / 2);
        if (await probe(middle)) {
            right = middle;
        } else {
            left = middle;
        }
    }

    return { attempts, minWidth: right, minHeight: right, result: right };
}
