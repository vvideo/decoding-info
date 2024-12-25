import { MAX_SIZE } from '../const.js';
import { binarySearch } from '../utils/binarySearch.js';
import { getDecodingInfo } from '../utils/getDecodingInfo.js';

export async function getSupportedHeight(params, supportedSize) {
    let smoothMaxHeight = null;

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
