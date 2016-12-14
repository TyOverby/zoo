import * as React from "react";
import * as ReactDOM from "react-dom";

import {LoadedQueueAction} from "./actions";
import render from "./render";
import {zooReducer, defaultState} from "./reducers";
import {httpGet} from "./util";
import MyStore from "./store";

let store = new MyStore(zooReducer, defaultState);
let container = document.getElementById("app");
let draw = () => ReactDOM.render(render(store.getState(), (a) => store.dispatch(a)), container);
store.subscribe(draw);
store.subscribe(() => {
    console.log(store.getState());
});
draw();


let all_configs = [
    {
        name: "perf run",
        server: "dotnet-ci2.cloudapp.net",
        path: ["dotnet_roslyn", "perf", "master", "perf_run"],
    },
    {
        name: "unit32",
        server: "ci.dot.net",
        path: ["dotnet_roslyn", 'master', 'windows_debug_unit32'],
    }
];


for(let config of all_configs)  {
    let path = [config.server, ... config.path].join("/");
    let url = `/api/viper/runs/${path}`;

    store.dispatch({
        type: "LOADING_QUEUE",
        name: config.name,
    });

    httpGet(url,
        function(error: string) {
            store.dispatch({
                type: "FAILED_QUEUE",
                name: config.name,
                message: error,
            });
        },

        function(content: string) {
            let json = JSON.parse(content);
            let out: LoadedQueueAction = {
                type: "LOADED_QUEUE",
                name: config.name,
                url: url,
                path: config.path,
                runs: json.runs,
            };
            store.dispatch(out);
        }
    )
}