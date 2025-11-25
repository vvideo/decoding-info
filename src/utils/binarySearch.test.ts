import { describe, it, expect } from '@jest/globals';
import { binarySearch } from './binarySearch.js';

describe('binarySearch', () => {
    it('should find exact match in the middle', async () => {
        const compareFn = (value: number) => {
            if (value === 50) return 0;
            if (value < 50) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 0, 100);
        expect(result).toBe(50);
    });

    it('should find exact match at the beginning', async () => {
        const compareFn = (value: number) => {
            if (value === 0) return 0;
            if (value < 0) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 0, 100);
        expect(result).toBe(0);
    });

    it('should find exact match near the end', async () => {
        const compareFn = (value: number) => {
            if (value === 99) return 0;
            if (value < 99) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 0, 100);
        expect(result).toBe(99);
    });

    it('should return null when value not found', async () => {
        const compareFn = (value: number) => {
            // Always return positive, meaning value is too large
            return 1;
        };

        const result = await binarySearch(compareFn, 0, 100);
        expect(result).toBeNull();
    });

    it('should return null when value is too small', async () => {
        const compareFn = (value: number) => {
            // Always return negative, meaning value is too small
            return -1;
        };

        const result = await binarySearch(compareFn, 0, 100);
        expect(result).toBeNull();
    });

    it('should work with async compare function', async () => {
        const compareFn = async (value: number) => {
            await new Promise(resolve => setTimeout(resolve, 1));
            if (value === 25) return 0;
            if (value < 25) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 0, 100);
        expect(result).toBe(25);
    });

    it('should handle single element range', async () => {
        const compareFn = (value: number) => {
            if (value === 5) return 0;
            if (value < 5) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 5, 6);
        expect(result).toBe(5);
    });

    it('should handle two element range with match at first', async () => {
        const compareFn = (value: number) => {
            if (value === 10) return 0;
            if (value < 10) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 10, 12);
        expect(result).toBe(10);
    });

    it('should handle two element range with match at second', async () => {
        const compareFn = (value: number) => {
            if (value === 11) return 0;
            if (value < 11) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 10, 12);
        expect(result).toBe(11);
    });

    it('should handle boundary case: value at maxValue-1', async () => {
        const compareFn = (value: number) => {
            if (value === 99) return 0;
            if (value < 99) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 0, 100);
        expect(result).toBe(99);
    });

    it('should work with large range', async () => {
        const target = 50000;
        const compareFn = (value: number) => {
            if (value === target) return 0;
            if (value < target) return -1;
            return 1;
        };

        const result = await binarySearch(compareFn, 0, 100000);
        expect(result).toBe(target);
    });

    it('should handle case where value is not at maxValue boundary', async () => {
        // This tests the edge case where maxValue itself might be the answer
        // but binarySearch uses [left, right) interval, so maxValue is excluded
        const compareFn = (value: number) => {
            if (value === 100) return 0;
            if (value < 100) return -1;
            return 1;
        };

        // maxValue = 101, so 100 should be found
        const result = await binarySearch(compareFn, 0, 101);
        expect(result).toBe(100);
    });
});
