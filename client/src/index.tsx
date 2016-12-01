import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/hello";
import { QueueView } from "./components/queue";
import { httpGet } from "./util";

httpGet("http://localhost:8083/api/runs/dotnet-ci2.cloudapp.net/dotnet_roslyn/perf/master/perf_run",
    function(error: string) { alert(error) },
    function(content: string) {
        var json = JSON.parse(content);
        ReactDOM.render(
            <QueueView {...json}></QueueView>,
            document.getElementById("root")
        );
    }
)