import { MAX_SIZE } from '../consts';
import { binarySearch } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getSupportedWidth(configuration: MediaDecodingConfiguration, supportedHeight: number) {
    let smoothMaxWidth: null | number = null;

    const result = await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: value,
                    height: supportedHeight,
                }
            }),
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: value + 1,
                    height: supportedHeight,
                }
            }),
        ]);

        if (data1.supported && data1.smooth) {
            smoothMaxWidth = Math.max(smoothMaxWidth || 0, value);
        }

        if (data1.supported !== data2.supported) {
            return 0;
        }

        if (data1.supported && data2.supported) {
            return 1;
        }

        return -1;
    }, supportedHeight, MAX_SIZE);

    return {
        result,
        smoothMaxWidth,
    };
}
