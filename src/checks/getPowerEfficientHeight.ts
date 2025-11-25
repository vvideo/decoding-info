import { MAX_SIZE } from '../consts';
import { binarySearch } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getPowerEfficientHeight(configuration: MediaDecodingConfiguration, supportedHeight: number, powerEfficientWidth: number) {
    return await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,                
                    width: powerEfficientWidth,
                    height: value,
                },
            }),
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: powerEfficientWidth,
                    height: value + 1,
                },
            }),
        ]);

        if (data1.powerEfficient && !data2.powerEfficient) {
            return 0;
        }

        if (data1.powerEfficient && data2.powerEfficient) {
            return 1;
        }

        return -1;
    }, supportedHeight, MAX_SIZE);
}
