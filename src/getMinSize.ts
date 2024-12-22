import { START_SIZE } from './consts';
import { binarySearch } from './utils/binarySearch';
import { getDecodingInfo } from './utils/getDecodingInfo';

export async function getMinSize(configuration: MediaDecodingConfiguration, getSupported: (result: MediaCapabilitiesDecodingInfo) => boolean, minSize: number) {
    let minWidth: undefined | number = undefined;

    let attempts = 0;

    const dataMinSize = await getDecodingInfo({
        ...configuration,
        video: {
            ...configuration.video!,
            width: minSize,
            height: minSize,
        }
    });

    attempts++;

    const supportedMinSize = getSupported(dataMinSize);
    if (supportedMinSize) {
        return {
            result: minSize,
            attempts,
            minWidth: minSize,
            minHeight: minSize,
        };
    }

    const result = await binarySearch(async (value) => {
        const data1 = await getDecodingInfo({
            ...configuration,
            video: {
                ...configuration.video!,
                width: value - 1,
                height: value - 1,
            }
        });

        attempts++;

        const supported1 = getSupported(data1);
        if (supported1) {
            minWidth = Math.min(minWidth || Infinity, value - 1);
            return 1;
        }

        const data2 = await getDecodingInfo({
            ...configuration,
            video: {
                ...configuration.video!,
                width: value,
                height: value,
            }
        });

        attempts++;

        const supported2 = getSupported(data2);
        if (supported2) {
            minWidth = Math.min(minWidth || Infinity, value);
        }

        if (supported1 !== supported2) {
            return 0;
        }

        if (supported1 && supported2) {
            return 1;
        }

        return -1;
    }, minSize, START_SIZE);

    return {
        result,
        attempts,
        minWidth,
        minHeight: minWidth,
    };
}
