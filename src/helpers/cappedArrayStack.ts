export class CappedArrayStack<T> {
    private limit: number;
    private array: T[];

    constructor({ limit }: { limit: number }) {
        this.limit = limit;
        this.array = [];
    }

    public push(item: T) {
        this.array.push(item);

        if (this.array.length > this.limit) {
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
