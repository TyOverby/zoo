import {httpGet} from "./util";

type Queue = {
    name: string,
    branch: string,
    server: string,
    path: string[],
    is_pr: boolean,
}

export function get_queues(cb: (queues: Queue[], error?: string) => void) {
    httpGet("/api/viper/joblist/ci.dot.net/dotnet_roslyn/",
        (e: string) => { cb([], e) },
        (c: string) => {
            const branches: string[] = JSON.parse(c);
            const r: Queue[] = [];

            let failed = false;
            let count = 0;
            let endCount = branches.length;

            for (const branch of branches) {
                httpGet(`/api/viper/joblist/ci.dot.net/dotnet_roslyn/job/${branch}`,
                    (e: string) => {
                        if (!failed) {
                            failed = true;
                            cb(r, e);
                        }
                    },
                    (c: string) => {
                        const obj: string[] = JSON.parse(c);
                        for (const name of obj) {
                            r.push({
                                name: branch + ": " + name,
                                branch: branch,
                                server: "ci.dot.net",
                                path: ["dotnet_roslyn", branch, name],
                                is_pr: name.indexOf("prtest") !== -1
                            })
                        }
                        cb(r);
                    });
            }
        });

}