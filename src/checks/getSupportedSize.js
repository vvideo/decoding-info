import { MAX_SIZE, START_SIZE } from '../const.js';
import { binarySearch  } from '../utils/binarySearch.js';
import { getDecodingInfo } from '../utils/getDecodingInfo.js';

export async function getSupportedSize(params) {
    let smoothMaxWidth = undefined;
    let smoothMaxHeight = undefined;

    const result = await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...params,
                video: {
                    ...params.video,                    
                    width: value,
                    height: value,
                }
            }),
            getDecodingInfo({
                ...params,
                video: {
                    ...params.video,
                    width: value + 1,
                    height: value + 1,
                }
            })
        ]);

        if (data1.supported && data1.smooth) {
            smoothMaxWidth = Math.max(smoothMaxWidth, value);
            smoothMaxHeight = Math.max(smoothMaxHeight, value);
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
