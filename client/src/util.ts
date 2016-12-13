import {ZooAction} from "./actions";

export type ContainsDispatcher = {
    dispatch: (action: ZooAction) => void,
} 

export function httpGet(url: string, error: (e: string) => any, success: (s: string) => any): void {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (ajax.readyState === XMLHttpRequest.DONE) {
            if (ajax.status === 200) {
                var json = JSON.parse(ajax.responseText);
                success(ajax.responseText);
            } else {
                error(ajax.statusText);
            }
        }
    };

    ajax.open("GET", url);
    ajax.send();
}

export function arrayWithModification<T>(array: T[], finder: (v: T)=> boolean, replacer: (v: T) => T, notPresent: () => T | null): T[] {
    let idx = -1;
    for (let i = 0; i < array.length; i++) {
        if (finder(array[i])) {
            idx = i;
        }
    } 

    if (idx !== -1) {
        let head = array.slice(0, idx);
        let tail = array.slice(idx + 1);
        return [...head, replacer(array[idx]), ...tail];
    } else {
        let n = notPresent();
        if (n !== null) {
            return [...array, n];
        } else {
            return array;
        }
    }
}