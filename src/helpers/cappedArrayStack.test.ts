import { describe, it, expect, beforeEach } from 'vitest';
import { CappedArrayStack } from './cappedArrayStack.js';

describe('CappedArrayStack', () => {
    let stack: CappedArrayStack<number>;

    beforeEach(() => {
        stack = new CappedArrayStack<number>({ limit: 3 });
    });

    it('should initialize with an empty array', () => {
        expect(stack.get()).toEqual([]);
    });

    it('should push items to the stack', () => {
        stack.push(1, 2);
        expect(stack.get()).toEqual([1, 2]);
    });

    it('should cap the array at the specified limit', () => {
        stack.push(1, 2, 3, 4);
        expect(stack.get()).toEqual([2, 3, 4]);
    });

    it('should clear the stack', () => {
        stack.push(1, 2, 3);
        stack.clear();
        expect(stack.get()).toEqual([]);
    });
});
