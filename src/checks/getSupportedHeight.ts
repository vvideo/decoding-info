import { MAX_SIZE } from '../consts';
import { binarySearch } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getSupportedHeight(configuration: MediaDecodingConfiguration, supportedWidth: number) {
    let smoothMaxHeight: null | number = null;

    const result = await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: supportedWidth,
                    height: value,
                },
            }),
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: supportedWidth,
                    height: value + 1,
                },
            })
        ]);

        if (data1.supported && data1.smooth) {
            smoothMaxHeight = Math.max(smoothMaxHeight || 0, value);
        }

        if (data1.supported !== data2.supported) {
            return 0;
        }

        if (data1.supported && data2.supported) {
            return 1;
        }

        return -1;
    }, supportedWidth, MAX_SIZE);

    return {
        result,
        smoothMaxHeight,
    };
}
