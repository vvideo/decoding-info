import { MIN_SIZE, MAX_SIZE } from '../consts';
import { binarySearch } from '../utils/binarySearch';
import { getDecodingInfo } from '../utils/getDecodingInfo';

export async function getPowerEfficientSize(configuration: MediaDecodingConfiguration, supportedSize: number) {
    let powerEfficient = false;

    const result = await binarySearch(async (value) => {
        const [data1, data2] = await Promise.all([
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: value,
                    height: value,
                },
            }),
            getDecodingInfo({
                ...configuration,
                video: {
                    ...configuration.video!,
                    width: value + 1,
                    height: value + 1,
                },
            })
        ]);

        if (data1.powerEfficient !== data2.powerEfficient) {
            return 0;
        }

        if (data1.powerEfficient && data2.powerEfficient) {
            powerEfficient = true;
            return 1;
        }

        return -1;
    }, MIN_SIZE, (supportedSize || MAX_SIZE) + 1);

    return {
        result,
        powerEfficient,
    };
}
