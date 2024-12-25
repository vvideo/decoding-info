import { getDecodingInfo } from './utils/getDecodingInfo.js';
import { getSupportedSize } from './checks/getSupportedSize.js';
import { getSupportedMinSize } from './checks/getSupportedMinSize.js';
import { getSupportedWidth } from './checks/getSupportedWidth.js';
import { getSupportedHeight } from './checks/getSupportedHeight.js';
import { getPowerEfficientSize } from './checks/getPowerEfficientSize.js';
import { getPowerEfficientWidth } from './checks/getPowerEfficientWidth.js';
import { getPowerEfficientHeight } from './checks/getPowerEfficientHeight.js';
import { MAX_SIZE, START_SIZE } from './const.js';

export async function findResolutionRestrictions(params) {
    const resultData = {
        supported: {
            error: null,
            value: false,
            maxWidth: 0,
            maxHeight: 0,
        },
        smooth: {
            value: false,
            maxWidth: 0,
            maxHeight: 0,
        },
        powerEfficient: {
            value: false,
            maxWidth: 0,
            maxHeight: 0,
        },
    };

    let supported = false;

    try {
        supported = await getDecodingInfo({
            ...params,
            video: {
                ...params.video,            
                width: START_SIZE,
                height: START_SIZE,
            },
        });
    } catch(error) {
        resultData.supported.error = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };

        return resultData;
    }

    if (!supported.supported) {
        return resultData;
    }

    resultData.supported.value = true;
    resultData.supported.maxWidth = Infinity;
    resultData.supported.maxHeight = Infinity;
    resultData.smooth.value = supported.smooth;

    const [supportedSize, supportedMinSize] = await Promise.all([getSupportedSize(params), getSupportedMinSize(params)]);
    if (supportedSize.smoothMaxWidth) {
        resultData.smooth.maxWidth = supportedSize.smoothMaxWidth;
        resultData.smooth.maxHeight = supportedSize.smoothMaxHeight;
    }

    if (supportedMinSize) {
        resultData.supported.minWidth = supportedMinSize;
        resultData.supported.minHeight = supportedMinSize;
    } else {
        resultData.supported.minWidth = 1;
        resultData.supported.minHeight = 1;
    }

    const [supportedWidth, supportedHeight, powerEfficientSize] = await Promise.all([
        getSupportedWidth(params, supportedSize.result),
        getSupportedHeight(params, supportedSize.result),
        getPowerEfficientSize(params, supportedSize.result),
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
        getPowerEfficientWidth(params, supportedSize.result, powerEfficientSize.result),
        getPowerEfficientHeight(params, supportedSize.result, powerEfficientSize.result)
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
