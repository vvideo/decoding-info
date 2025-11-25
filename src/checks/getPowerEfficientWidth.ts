import { MAX_SIZE } from '../consts';
import { binarySearch } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getPowerEfficientWidth(configuration: MediaDecodingConfiguration, supportedWidth: number, powerEfficientHeight: number) {
    return await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,                
                    width: value,
                    height: powerEfficientHeight,
                },
            }),
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: value + 1,
                    height: powerEfficientHeight,
                },
            })
        ]);

        if (data1.powerEfficient && !data2.powerEfficient) {
            return 0;
        }

        if (data1.powerEfficient && data2.powerEfficient) {
            return 1;
        }

        return -1;
    }, supportedWidth, MAX_SIZE);
}