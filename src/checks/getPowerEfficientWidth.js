import { MAX_SIZE } from '../const.js';
import { binarySearch } from '../utils/binarySearch.js';
import { getDecodingInfo } from '../utils/getDecodingInfo.js';

export async function getPowerEfficientWidth(params, supportedSize, powerEfficientSize) {
    return await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...params,
                video: {
                    ...params.video,                
                    width: value,
                    height: powerEfficientSize,
                },
            }),
            getDecodingInfo({
                ...params,
                video: {
                    ...params.video,
                    width: value + 1,
                    height: powerEfficientSize,
                },
            })
        ]);

        if (data1.powerEfficient !== data2.powerEfficient) {
            return 0;
        }

        if (data1.powerEfficient && data2.powerEfficient) {
            return 1;
        }

        return -1;
    }, supportedSize, MAX_SIZE);
}