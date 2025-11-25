export async function binarySearch(
    compareFn: (value: number) => Promise<number> | number,
    minValue: number,
    maxValue: number
): Promise<number | null> {
    let left = minValue;
    let right = maxValue;

    while (left <= right) {
        const middle = Math.floor((right + left) / 2);
        console.log('middle', middle);
        const cmp = await compareFn(middle);
        if (cmp === 0) {
            return middle;
        } else if (cmp < 0) {
            left = middle + 1;            
        } else {
            right = middle - 1;
        }

        console.log('left', left);
        console.log('right', right);
    }

    return null;
}
