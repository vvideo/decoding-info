import { MAX_SIZE } from '../consts';
import { binarySearch } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getSupportedHeight(params: MediaDecodingConfiguration, supportedSize) {
    let smoothMaxHeight: null | number = null;

    const result = await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...params,
                video: {
                    ...params.video,
                    width: supportedSize,
                    height: value,
                },
            }),
            getDecodingInfo({
                ...params,
                video: {
                    ...params.video,
                    width: supportedSize,
                    height: value + 1,
                },
            })
        ]);

        if (data1.supported && data1.smooth) {
            smoothMaxHeight = Math.max(smoothMaxHeight, value);
        }

        if (data1.supported !== data2.supported) {
            return 0;
        }

        if (data1.supported && data2.supported) {
            return 1;
        }

        return -1;
    }, supportedSize, MAX_SIZE);

    return {
        result,
        smoothMaxHeight,
    };
}
