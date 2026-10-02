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

interface VideoDecodingConfiguration extends MediaDecodingConfiguration {
    video: VideoConfiguration;
}

function toError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}

export async function getVideoCodecSupportedResolution(configuration: VideoDecodingConfiguration, options?: GetVideoCodecSupportedResolutionOptions) {
    const minSize = options?.minSize === undefined ? MIN_SIZE : options.minSize;
    const maxSize = options?.maxSize === undefined ? MAX_SIZE : options.maxSize;
    const startSize = options?.startSize === undefined ? START_SIZE : options.startSize;
    const cache = new Map<number, Promise<MediaCapabilitiesDecodingInfo>>();
    const probe = (size: number) => {
        let pending = cache.get(size);
        if (!pending) {
            pending = getDecodingInfo({
                ...configuration,
                video: { ...configuration.video, width: size, height: size },
            });
            cache.set(size, pending);
        }
        return pending;
    };

    const resultData: ResultData = {
        error: null,
        attempts: 0,
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

    if (!configuration?.video) {
        resultData.error = new TypeError('Video configuration is required');
        return resultData;
    }

    if (![minSize, maxSize, startSize].every((size) => Number.isSafeInteger(size) && size > 0)) {
        resultData.error = new RangeError('Resolution sizes must be positive safe integers');
        return resultData;
    }
    if (minSize > maxSize || startSize < minSize || startSize > maxSize) {
        resultData.error = new RangeError('Expected minSize <= startSize <= maxSize');
        return resultData;
    }

    let decodingInfo: MediaCapabilitiesDecodingInfo;
    try {
        decodingInfo = await probe(startSize);
    } catch(error: unknown) {
        resultData.error = toError(error);
        resultData.attempts = cache.size;
        return resultData;
    }
    resultData.attempts = cache.size;

    if (!decodingInfo.supported) {
        return resultData;
    }

    resultData.supported.value = true;

    const searches = [
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
    ] as const;
    let searchResults: Awaited<ReturnType<typeof Promise.all<typeof searches>>>;
    try {
        searchResults = await Promise.all(searches);
    } catch (error: unknown) {
        await Promise.allSettled(searches);
        resultData.error = toError(error);
        resultData.attempts = cache.size;
        return resultData;
    }
    const [
        supportedMinSize, supportedMaxSize,
        smoothMinSize, smoothMaxSize,
        powerEfficientMinSize, powerEfficientMaxSize
    ] = searchResults;

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
