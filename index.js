const input = document.querySelector('#codec');
const selectType = document.querySelector('#select-type');
const selectKeySystem = document.querySelector('#select-keysystem');
const submit = document.querySelector('#submit');
const result = document.querySelector('#result');
const robustness = document.querySelector('#robustness');

submit.onclick = () => {
    findMaxResolution({
        contentType: input.value,
        type: selectType.value,
        keySystem: selectKeySystem.value,
        robustness: robustness.value,
    });    
}

async function binarySearch(compareFn, minValue, maxValue) {
    let left = minValue;
    let right = maxValue;

    while (left < right) {
        const mid = left + Math.floor((right - left) / 2);
        const cmp = await compareFn(mid);
        if (cmp === 0) {
            return mid;
        } else if (cmp < 0) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }

    return null;
};

const MAX_SIZE = 1_024_000;

async function findMaxResolution(data) {
    const contentType = data.contentType;
    const type = data.type;

    const keySystemConfiguration = data.keySystem ? {
        keySystem: data.keySystem,
        robustness: data.robustness || undefined,
    } : undefined;

    const minHeight = 240;
    const minWidth = 1024;

    const maxHeight = MAX_SIZE;
    const maxWidth = MAX_SIZE;

    let resultData = {
        supported: {
            maxWidth: maxWidth,
            maxHeight: maxHeight,
        },
        smooth: {
            maxWidth: 0,
            maxHeight: 0,
        },
        powerEfficient: {
            maxWidth: 0,
            maxHeight: 0,
        },
    };

    const supportedWidth = await binarySearch(async (value) => {
        const supported1 = (await getCodecInfo({
            contentType,
            type,
            width: value,
            height: minHeight,
            keySystemConfiguration,
        })).supported;
        const supported2 = (await getCodecInfo({
            contentType,
            type,
            width: value + 1,
            height: minHeight,
            keySystemConfiguration,
        })).supported;

        console.log(keySystemConfiguration, supported1, supported2);

        if (supported1 !== supported2) {
            return 0;
        }

        if (supported1 && supported2) {
            return 1;
        }

        return -1;
    }, minWidth, maxWidth);

    const powerEfficientWidth = await binarySearch(async (value) => {
        console.log({
            width: value,
            height: minHeight,
            keySystemConfiguration,
        });
        const powerEfficient1 = (await getCodecInfo({
            contentType, type,
            width: value,
            height: minHeight,
            keySystemConfiguration,
        })).powerEfficient;
        const powerEfficient2 = (await getCodecInfo({
            contentType,
            type,
            width: value + 1,
            height: minHeight,
            keySystemConfiguration,
        })).powerEfficient;

        console.log({
            width: value,
            height: minHeight,
            keySystemConfiguration,
            powerEfficient1,
            powerEfficient2,
        });

        if (powerEfficient1 !== powerEfficient2) {
            return 0;
        }

        if (powerEfficient1 && powerEfficient2) {
            return 1;
        }

        return -1;
    }, minWidth, (supportedWidth || maxWidth) + 1);    

    const supportedHeight = await binarySearch(async (value) => {
        const supported1 = (await getCodecInfo({
            contentType,
            type,
            width: supportedWidth,
            height: value,
            keySystemConfiguration,
        })).supported;
        const supported2 = (await getCodecInfo({
            contentType,
            type, 
            width: supportedWidth,
            height: value + 1,
            keySystemConfiguration,
        })).supported;
        if (supported1 !== supported2) {
            return 0;
        }

        if (supported1 && supported2) {
            return 1;
        }

        return -1;
    }, minHeight, maxHeight);

    const powerEfficientHeight = await binarySearch(async (value) => {
        const powerEfficient1 = (await getCodecInfo({
            contentType,
            type,
            width: powerEfficientWidth || minWidth,
            height: value,
            keySystemConfiguration,
        })).powerEfficient;

        const powerEfficient2 = (await getCodecInfo({
            contentType,
            type,
            width: powerEfficientWidth || minWidth,
            height: value + 1,
            keySystemConfiguration
        })).powerEfficient;

        if (powerEfficient1 !== powerEfficient2) {
            return 0;
        }

        if (powerEfficient1 && powerEfficient2) {
            return 1;
        }

        return -1;
    }, minHeight, (supportedHeight || maxHeight) + 1);    

    resultData.supported = {
        width: supportedWidth,
        height: supportedHeight,
    };

    resultData.powerEfficient = {
        width: powerEfficientWidth,
        height: powerEfficientHeight,
    };

    console.log('result', resultData);
    result.innerText = JSON.stringify(resultData, null, 4); 
}

function getCodecInfo(data) {
    const configuration = {
        type: data.type,
        video: {
            contentType: data.contentType,
            width: data.width,
            height: data.height,
            bitrate: 2000000,
            framerate: 25
        },        
    };    
    
    if (data.keySystemConfiguration) {
        configuration.keySystemConfiguration = data.keySystemConfiguration;
    }

    return navigator.mediaCapabilities.decodingInfo(configuration)
        .then((result) => {
            // console.log(result, 'Decoding of ' + contentType + ' is'
            //     + (result.supported ? '' : ' NOT') + ' supported,'
            //     + (result.smooth ? '' : ' NOT') + ' smooth and'
            //     + (result.powerEfficient ? '' : ' NOT') + ' power efficient');

            return result;
        })
        .catch((err) => {
            console.error(err, ' caused decodingInfo to reject');
        });
}
