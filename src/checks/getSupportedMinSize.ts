import { MIN_SIZE, START_SIZE } from '../consts';
import { binarySearch } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getSupportedMinSize(params) {
    return await binarySearch(async (value) => {
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
                    width: value - 1,
                    height: value - 1,
                }
            })
        ]);

        if (data1.supported && !data2.supported) {
            return 0;
        }

        if (data1.supported && data2.supported) {
            return -1;
        }

        return 1;
    }, MIN_SIZE + 1, START_SIZE);
}
