import * as React from "react";
import {Queue, Run} from "../viper/state";

export class RunView extends React.Component<Run, {}> {
    render() {
        return <li> {this.props.id}: {this.props.status}</li>
    }
}

function queueHealth(runs: Run[]): string {
    let recent = runs.filter(run => run.status !== "queued" && run.status !== "running")
                         .slice(0, 10);
    let count_failures = recent.filter(run => run.status === "failed").length;

    if (recent[0].status === "failed" || count_failures > 3) {
        return "error";
    }

    if (count_failures === 3) {
        return "warn";
    }

    return "ok";
}

export class QueueView extends React.Component<Queue, {collapsed: boolean}> {
    constructor(props: Queue) {
        super(props);
        this.state = {collapsed: false};
    }

    render() {
        let path = this.props.path;
        let name = path[path.length - 1];

        let children = this.props.runs.map(run => <RunView {...run} key={run.id}> </RunView>);
        if (this.state.collapsed) {
            children = [];
        }

        let toggleVisibility = () => this.setState({collapsed: !this.state.collapsed});

        return (
        <div className={"queue " + queueHealth(this.props.runs)}>
            <h1 onClick={toggleVisibility}> {name} </h1>
            <ul> {children} </ul>
        </div>);
    }
}