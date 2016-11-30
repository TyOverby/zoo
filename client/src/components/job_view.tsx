import * as React from "react";
import {JobJson, JobStatus} from "../foreign";

export interface JobProps {
    job: JobJson
}

export interface BuildProps {
    id: number,
    status: JobStatus,
}

export class BuildView extends React.Component<BuildProps, {}> {
    render() {
        return <li> {this.props.id}: {this.props.status}</li>
    }
}

export class JobView extends React.Component<JobProps, {}> {
    render() {
        let path = this.props.job.path;
        let name = path[path.length - 1];
        let children = this.props.job.builds.map(job => <BuildView {...job} key={job.id}> </BuildView>);
        return <div> <h1> {name} </h1> <ul> {children} </ul> </div>;
    }
}