import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/hello";
import { JobView } from "./components/job_view";

var ajax = new XMLHttpRequest();
ajax.onreadystatechange = function () {
    if (ajax.readyState === XMLHttpRequest.DONE) {
        if (ajax.status === 200) {
            var json = JSON.parse(ajax.responseText);
            ReactDOM.render(
                <JobView job={json}></JobView>,
                //new JobView(JSON.parse(ajax.responseText)),
                document.getElementById("example")
            );
        }
    }
};

ajax.open("GET", "http://localhost:8083/api/runs/dotnet-ci2.cloudapp.net/dotnet_roslyn/perf/master/perf_run");
ajax.send();
