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

    const resultData: ResultData = {
        error: null,
        attempts: 1,
        supported: {
            value: false,
            minHeight: undefined,
            minWidth: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        },
        smooth: {
            value: false,
            minHeight: undefined,
            minWidth: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        },
        powerEfficient: {
            value: false,
            minHeight: undefined,
            minWidth: undefined,
            maxWidth: undefined,
            maxHeight: undefined,
        },
    };

    let decodingInfo: MediaCapabilitiesDecodingInfo;
    try {
        decodingInfo = await getDecodingInfo({
            ...configuration,
            video: {
                ...configuration.video!,
                width: startSize,
                height: startSize,
            },
        });
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
        getMinSize(configuration, (result) => result.supported, minSize),
        getMaxSize(configuration, (result) => result.supported, maxSize),
        getMinSize(configuration, (result) => result.supported && result.smooth, minSize),
        getMaxSize(configuration, (result) => result.supported && result.smooth, maxSize),
        getMinSize(configuration, (result) => result.supported && result.powerEfficient, minSize),
        getMaxSize(configuration, (result) => result.supported && result.powerEfficient, maxSize),
    ]);

    if (supportedMinSize.minWidth) {
        resultData.supported.minWidth = supportedMinSize.minWidth;
        resultData.supported.minHeight = supportedMinSize.minHeight;
    }

    if (supportedMaxSize.maxWidth) {
        resultData.supported.maxWidth = supportedMaxSize.maxWidth;
        resultData.supported.maxHeight = supportedMaxSize.maxHeight;
    }

    if (smoothMinSize.minWidth) {
        resultData.smooth.value = true;
        resultData.smooth.minWidth = smoothMinSize.minWidth;
        resultData.smooth.minHeight = smoothMinSize.minHeight;
    }

    if (smoothMaxSize.maxWidth) {
        resultData.smooth.value = true;
        resultData.smooth.maxWidth = smoothMaxSize.maxWidth;
        resultData.smooth.maxHeight = smoothMaxSize.maxHeight;
    }

    if (powerEfficientMinSize.minHeight) {
        resultData.powerEfficient.value = true;
        resultData.powerEfficient.minWidth = powerEfficientMinSize.minWidth;
        resultData.powerEfficient.minHeight = powerEfficientMinSize.minHeight;
    }

    if (powerEfficientMaxSize.maxWidth) {
        resultData.powerEfficient.value = true;
        resultData.powerEfficient.maxWidth = powerEfficientMaxSize.maxWidth;
        resultData.powerEfficient.maxHeight = powerEfficientMaxSize.maxHeight;
    }

    resultData.attempts += (
        supportedMinSize.attempts +
        supportedMaxSize.attempts +
        smoothMinSize.attempts +
        smoothMaxSize.attempts +
        powerEfficientMinSize.attempts +
        powerEfficientMaxSize.attempts
    );

    return resultData;
}
