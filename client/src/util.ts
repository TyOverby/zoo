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