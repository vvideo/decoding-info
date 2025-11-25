import { getDecodingInfo } from './utils/getDecodingInfo';
import { getSupportedMaxSize } from './checks/getSupportedMaxSize';
import { getSupportedMinSize } from './checks/getSupportedMinSize';
import { getSupportedWidth } from './checks/getSupportedWidth';
import { getSupportedHeight } from './checks/getSupportedHeight';
import { getPowerEfficientSize } from './checks/getPowerEfficientSize';
import { getPowerEfficientWidth } from './checks/getPowerEfficientWidth';
import { getPowerEfficientHeight } from './checks/getPowerEfficientHeight';
import { MAX_SIZE, START_SIZE } from './consts';

interface ResultData {
    supported: {
        error: null | Error;
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

export async function findResolutionRestrictions(configuration: MediaDecodingConfiguration) {
    const resultData: ResultData = {
        supported: {
            error: null,
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
                width: START_SIZE,
                height: START_SIZE,
            },
        });
    } catch(error: any) {
        resultData.supported.error = error;

        return resultData;
    }

    if (!decodingInfo.supported) {
        return resultData;
    }

    resultData.supported.value = true;
    resultData.supported.maxWidth = Infinity;
    resultData.supported.maxHeight = Infinity;
    resultData.smooth.value = decodingInfo.smooth;

    const [supportedMaxSize, supportedMinSize] = await Promise.all([getSupportedMaxSize(configuration), getSupportedMinSize(configuration)]);
    if (supportedMaxSize.smoothMaxWidth) {
        resultData.smooth.maxWidth = supportedMaxSize.smoothMaxWidth;
        resultData.smooth.maxHeight = supportedMaxSize.smoothMaxHeight;
    }

    if (supportedMinSize) {
        resultData.supported.minWidth = supportedMinSize;
        resultData.supported.minHeight = supportedMinSize;
    } else {
        resultData.supported.minWidth = 1;
        resultData.supported.minHeight = 1;
    }

    const [supportedWidth, supportedHeight, powerEfficientSize] = await Promise.all([
        getSupportedWidth(configuration, supportedMaxSize.result!),
        getSupportedHeight(configuration, supportedMaxSize.result!),
        getPowerEfficientSize(configuration, supportedMaxSize.result!),
    ]);

    if (supportedWidth.result) {
        resultData.supported.maxWidth = supportedWidth.result;
    }

    if (supportedHeight.result) {
        resultData.supported.maxHeight = supportedHeight.result;
    }

    if (supportedWidth.smoothMaxWidth) {
        if (supportedWidth.smoothMaxWidth === MAX_SIZE - 1) {
            resultData.smooth.maxWidth = Infinity;
        } else {
            resultData.smooth.maxWidth = supportedWidth.smoothMaxWidth;
        }
    }

    if (supportedHeight.smoothMaxHeight) {
        if (supportedHeight.smoothMaxHeight === MAX_SIZE - 1) {
            resultData.smooth.maxHeight = Infinity;
        } else {
            resultData.smooth.maxHeight = supportedHeight.smoothMaxHeight;
        }
    }

    if (powerEfficientSize.powerEfficient) {
        resultData.powerEfficient.value = powerEfficientSize.powerEfficient;
    }

    const [powerEfficientWidth, powerEfficientHeight] = await Promise.all([
        getPowerEfficientWidth(configuration, supportedMaxSize.result!, powerEfficientSize.result!),
        getPowerEfficientHeight(configuration, supportedMaxSize.result!, powerEfficientSize.result!)
    ]);

    if (powerEfficientSize.result && powerEfficientWidth === null) {
        resultData.powerEfficient.maxWidth = Infinity;
    }

    if (powerEfficientSize.result && powerEfficientHeight === null) {
        resultData.powerEfficient.maxHeight = Infinity;
    }

    if (powerEfficientWidth) {
        resultData.powerEfficient.maxWidth = powerEfficientWidth;
    }

    if (powerEfficientHeight) {
        resultData.powerEfficient.maxHeight = powerEfficientHeight;
    }

    return resultData;
}
