export class CappedArrayStack<T> {
    private limit: number;
    private array: T[];

    constructor({ limit }: { limit: number }) {
        this.limit = limit;
        this.array = [];
    }

    public push(...items: T[]) {
        this.array.push(...items);

        while (this.array.length > this.limit) {
            this.array.shift();
        }
    }

    public get() {
        return this.array;
    }

    public clear() {
        this.array = [];
    }
}
