import { getDecodingInfo } from './utils/getDecodingInfo';
import { MAX_SIZE, MIN_SIZE, START_SIZE } from './consts';
import { getMaxSize } from './getMaxSize';
import { getMinSize } from './getMinSize';

interface ResultData {
    error: null | Error;
    attempts: number,
    supported: {
        value: boolean;
        minWidth: number | undefined;
        minHeight: number | undefined;
        maxWidth: number | undefined;
        maxHeight: number | undefined;
    };
    smooth: {
        value: boolean;
        minWidth: number | undefined;
        minHeight: number | undefined;
        maxWidth: number | undefined;
        maxHeight: number | undefined;
    };
    powerEfficient: {
        value: boolean;
        minWidth: number | undefined;
        minHeight: number | undefined;
        maxWidth: number | undefined;
        maxHeight: number | undefined;
    };
};

interface GetVideoCodecSupportedResolutionOptions {
    minSize?: number;
    maxSize?: number;
    startSize?: number;
}

export async function getVideoCodecSupportedResolution(configuration: MediaDecodingConfiguration, options?: GetVideoCodecSupportedResolutionOptions) {
    const minSize = options?.minSize || MIN_SIZE;
    const maxSize = options?.maxSize || MAX_SIZE;
    const startSize = options?.startSize || START_SIZE;
    const cache = new Map<number, Promise<MediaCapabilitiesDecodingInfo>>();
    const probe = (size: number) => {
        let pending = cache.get(size);
        if (!pending) {
            pending = getDecodingInfo({
                ...configuration,
                video: { ...configuration.video!, width: size, height: size },
            });
            cache.set(size, pending);
        }
        return pending;
    };

    const resultData: ResultData = {
        error: null,
        attempts: 1,
        supported: {
            value: false,
            minWidth: undefined,
            minHeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        },
        smooth: {
            value: false,
            minWidth: undefined,
            minHeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        },
        powerEfficient: {
            value: false,
            minWidth: undefined,
            minHeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        },
    };

    let decodingInfo: MediaCapabilitiesDecodingInfo;
    try {
        decodingInfo = await probe(startSize);
    } catch(error: any) {
        resultData.error = error;

        return resultData;
    }

    if (!decodingInfo.supported) {
        return resultData;
    }

    resultData.supported.value = true;

    const [
        supportedMinSize, supportedMaxSize,
        smoothMinSize, smoothMaxSize,
        powerEfficientMinSize, powerEfficientMaxSize
    ] = await Promise.all([
        getMinSize(configuration, (result) => result.supported, minSize, startSize, probe),
        getMaxSize(configuration, (result) => result.supported, maxSize, startSize, probe),
        decodingInfo.smooth
            ? getMinSize(configuration, (result) => result.supported && result.smooth, minSize, startSize, probe)
            : Promise.resolve(null),
        decodingInfo.smooth
            ? getMaxSize(configuration, (result) => result.supported && result.smooth, maxSize, startSize, probe)
            : Promise.resolve(null),
        decodingInfo.powerEfficient
            ? getMinSize(configuration, (result) => result.supported && result.powerEfficient, minSize, startSize, probe)
            : Promise.resolve(null),
        decodingInfo.powerEfficient
            ? getMaxSize(configuration, (result) => result.supported && result.powerEfficient, maxSize, startSize, probe)
            : Promise.resolve(null),
    ]);

    if (supportedMinSize.minWidth) {
        resultData.supported.minWidth = supportedMinSize.minWidth;
        resultData.supported.minHeight = supportedMinSize.minHeight;
    }

    if (supportedMaxSize.maxWidth) {
        resultData.supported.maxWidth = supportedMaxSize.maxWidth;
        resultData.supported.maxHeight = supportedMaxSize.maxHeight;
    }

    if (smoothMinSize?.minWidth) {
        resultData.smooth.value = true;
        resultData.smooth.minWidth = smoothMinSize.minWidth;
        resultData.smooth.minHeight = smoothMinSize.minHeight;
    }

    if (smoothMaxSize?.maxWidth) {
        resultData.smooth.value = true;
        resultData.smooth.maxWidth = smoothMaxSize.maxWidth;
        resultData.smooth.maxHeight = smoothMaxSize.maxHeight;
    }

    if (powerEfficientMinSize?.minHeight) {
        resultData.powerEfficient.value = true;
        resultData.powerEfficient.minWidth = powerEfficientMinSize.minWidth;
        resultData.powerEfficient.minHeight = powerEfficientMinSize.minHeight;
    }

    if (powerEfficientMaxSize?.maxWidth) {
        resultData.powerEfficient.value = true;
        resultData.powerEfficient.maxWidth = powerEfficientMaxSize.maxWidth;
        resultData.powerEfficient.maxHeight = powerEfficientMaxSize.maxHeight;
    }

    resultData.attempts = cache.size;

    return resultData;
}
