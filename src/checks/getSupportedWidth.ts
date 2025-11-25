import { MAX_SIZE } from '../consts';
import { binarySearch } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getSupportedWidth(params, supportedSize) {
    let smoothMaxWidth = null;

    const result = await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...params,
                video: {
                    ...params.video,                    
                    width: value,
                    height: supportedSize,
                }
            }),
            getDecodingInfo({
                ...params,
                video: {
                    ...params.video,
                    width: value + 1,
                    height: supportedSize,
                }
            }),
        ]);

        if (data1.supported && data1.smooth) {
            smoothMaxWidth = Math.max(smoothMaxWidth, value);
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
        smoothMaxWidth,
    };
}
