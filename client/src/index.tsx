import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/hello";
import { QueueView } from "./components/queue";
import { httpGet } from "./util";
import render from "./render";
import { AppState, QueueState, QueueStateTag } from "./state";

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

class AppStateSingleton implements AppState {
    queues: QueueState[];
    draw_queued: boolean;
    constructor(states: QueueState[]) {
        this.queues = states
        this.draw_queued = false;
    }

    update(name: string, data: QueueState) {
        for (let i in this.queues) {
            let queue = appState.queues[i];
            if (queue.name === name) {
                this.queues[i] = data;
            }
        }
        this.scheduleDraw();
    }
    scheduleDraw() {
        if (this.draw_queued) { return; }
        window.requestAnimationFrame(() => {
            this.draw();
            this.draw_queued = false;
        });
        this.draw_queued = true;
    }
    draw() {
        ReactDOM.render(render(this), document.getElementById("example"));
    }
}
let appState = new AppStateSingleton(
    all_configs.map(c => ({
        state: QueueStateTag.Loading,
        name: c.name
    })) as QueueState[])

appState.scheduleDraw();

for (let config of all_configs) {
    let path = [config.server, ... config.path].join("/");
    let url = `http://localhost:8083/api/runs/${path}`;

    httpGet(url,
        function(error: string) {
            appState.update(config.name, {
                name: config.name,
                state: QueueStateTag.Failed,
                message: error,
            })
         },
        function(content: string) {
            let json = JSON.parse(content);
            appState.update(config.name, {
                name: config.name,
                state: QueueStateTag.Loaded,
                queue: json,
            })
        }
    )
}

