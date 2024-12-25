export async function binarySearch(compareFn, minValue, maxValue) {
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
