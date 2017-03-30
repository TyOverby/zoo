export function add_or_update<T>(obj: T, splitter: string, keys: string, value: any): T {
    function update(obj: any, keyQ: string[], value: any) {
        let next = keyQ.shift() || "";
        if (next === "*" && keyQ.length === 0) {
            for (let k in obj) {
                obj[k] = value;
            }
        } else if (next === "*") {
            for (let k in obj) {
                update(obj[k], keyQ.slice(0), value);
            }
        } else if (keyQ.length === 0) {
            obj[next] = value;
        } else {
            update(obj[next], keyQ, value);
        }
    }

    let new_obj: T = JSON.parse(JSON.stringify(obj));
    update(new_obj, keys.split(splitter), value);
    return new_obj;
}

export function push_to_array<T>(obj: T, splitter: string, keys: string, value: any): T {
    function update(obj: any, keyQ: string[], value: any) {
        let next = keyQ.shift() || "";
        if (keyQ.length == 0) {
            obj[next].push(value);
        } else {
            update(obj[next], keyQ, value);
        }
    }

    let new_obj: T = JSON.parse(JSON.stringify(obj));
    update(new_obj, keys.split(splitter), value);
    return new_obj;
}