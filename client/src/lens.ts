class ObjectLens<T> {
    here: T
    constructor(v: T) {
        this.here = v;
    }

    // down<I, K extends (keyof T) & I[]>(key: K): ArrayLens<I>;
    down<K extends keyof T>(key: K): ObjectLens<T[K]>
    {
        return lens(this.here[key]);
    }

    which() {
        console.log("obj");
    }
}

class ArrayLens<I, T extends I[]> extends ObjectLens<I[]> {
    constructor(v: I[]) {
        super(v)
    }

    which() {
        console.log("array");
    }
}

function lens<T>(v: T): ObjectLens<T>;
function lens<I, T extends I[]>(v: T): ArrayLens<I, T>
{
    if (Array.isArray(v)) { 
        return new ArrayLens(v);
    } else {
        return new ObjectLens(v);
    }  
}

let objlens: ObjectLens<{x: number, a: number[]}> = lens({x: 5, a: [1, 2, 3]});
let arrlens: ArrayLens<number, number[]> = lens([4, 5]);
let vlens: ObjectLens<number> = lens(5);

let deepNumLens: ObjectLens<number> = objlens.down("x");
let deepArrLens: ArrayLens<number, number[]> = objlens.down("a");

deepNumLens.which();
deepArrLens.which();
