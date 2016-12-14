class ObjectLens<T extends Object> {
    here: T
    constructor(v: T) {
        this.here = v;
    }
}

class ArrayLens<I> {
    here: I[]
    constructor(v: I[]) {
        this.here = v;
    }
}

function lens<T>(v: T): ObjectLens<T>;
function lens<I, T extends I[]>(v: T): ArrayLens<I>
{
    if (Array.isArray(v)) { 
        return new ArrayLens(v);
    } else if (typeof v == "object") {
        return new ObjectLens(v);
    }  
    throw "unreachable";
}

let objlens: ObjectLens<{x: number}> = lens({x: 5});
let arrlens: ArrayLens<number> = lens([4, 5]);
let vlens: ObjectLens<number> = lens(5);