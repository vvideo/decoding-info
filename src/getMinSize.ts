import { START_SIZE } from './consts';
import { binarySearch } from './utils/binarySearch';
import { getDecodingInfo } from './utils/getDecodingInfo';

export async function getMinSize(configuration: MediaDecodingConfiguration, getSupported: (result: MediaCapabilitiesDecodingInfo) => boolean, minSize: number) {
    let minWidth: undefined | number = undefined;
    let attempts = 1;

    const dataMinSize = await getDecodingInfo({
        ...configuration,
        video: {
            ...configuration.video!,
            width: minSize,
            height: minSize,
        }
    });

    const supportedMinSize = getSupported(dataMinSize);
    if (supportedMinSize) {
        return {
            attempts,
            minWidth: minSize,
            minHeight: minSize,
            result: minSize,
        };
    }

    const result = await binarySearch(async (value) => {
        attempts++;
        const data1 = await getDecodingInfo({
            ...configuration,
            video: {
                ...configuration.video!,
                width: value - 1,
                height: value - 1,
            }
        });

        const supported1 = getSupported(data1);
        if (supported1) {
            minWidth = Math.min(minWidth || Infinity, value - 1);
            return 1;
        }

        attempts++;
        const data2 = await getDecodingInfo({
            ...configuration,
            video: {
                ...configuration.video!,
                width: value,
                height: value,
            }
        });

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
        attempts,
        minWidth,
        minHeight: minWidth,
        result,
    };
}
