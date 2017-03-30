import * as React from "react";
import * as ReactDOM from "react-dom";

import {LoadedQueueAction} from "./actions";
import render from "./render";
import {get_queues} from "./config";
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

get_queues((queues, e) => {
    if (e !== undefined) {
        alert(e);
    }

    for(let config of queues)  {
        let path = [config.server, ... config.path].join("/");
        let url = `/api/viper/runs/${path}`;

        store.dispatch({
            type: "NEW_BRANCH",
            branch: config.branch,
        });

        store.dispatch({
            type: "LOADING_QUEUE",
            name: config.name,
            branch: config.branch,
        });

        httpGet(url,
            function(error: string) {
                store.dispatch({
                    type: "FAILED_QUEUE",
                    name: config.name,
                    message: error,
                    branch: config.branch,
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
                    branch: config.branch,
                };
                store.dispatch(out);
            }
        )
    }
});