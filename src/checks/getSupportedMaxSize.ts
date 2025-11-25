import { MAX_SIZE, START_SIZE } from '../consts';
import { binarySearch  } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getSupportedMaxSize(configuration: MediaDecodingConfiguration) {
    let smoothMaxWidth: undefined | number = undefined;
    let smoothMaxHeight: undefined | number = undefined;

    const result = await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: value,
                    height: value,
                }
            }),
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: value + 1,
                    height: value + 1,
                }
            })
        ]);

        if (data1.supported && data1.smooth) {
            smoothMaxWidth = Math.max(smoothMaxWidth || 0, value);
            smoothMaxHeight = Math.max(smoothMaxHeight || 0, value);
        }

        if (data1.supported !== data2.supported) {
            return 0;
        }

        if (data1.supported && data2.supported) {
            return 1;
        }

        return -1;
    }, START_SIZE, MAX_SIZE);

    return {
        result,
        smoothMaxWidth,
        smoothMaxHeight,
    };
}
