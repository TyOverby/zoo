import * as React from "react";
import {LoadedQueueState, RunState} from "../state";
import {ContainsDispatcher} from "../util";

export class RunView extends React.Component<RunState & ContainsDispatcher, {}> {
    render() {
        return <li> {this.props.id}: {this.props.status}</li>
    }
}

function queueHealth(runs: RunState[]): string {
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

export class QueueView extends React.Component<LoadedQueueState & ContainsDispatcher, {}> {
    constructor(props: LoadedQueueState & ContainsDispatcher) {
        props.runs.sort((a, b) => b.id - a.id);
        super(props);
        this.state = {collapsed: false};
    }

    render() {
        let path = this.props.path;
        let children = this.props.runs.map(run => <RunView { ...run } dispatch={this.props.dispatch} key={run.id}> </RunView>);
        if (this.props.collapsed) {
            children = [];
        }

        let toggleVisibility = () => this.props.dispatch({
            type: "TOGGLE_COLLAPSE_QUEUE",
            name: this.props.name,
        });

        return (
        <div className={"queue " + queueHealth(this.props.runs)}>
            <h1 onClick={toggleVisibility}> {this.props.name} </h1>
            <ul> {children} </ul>
        </div>);
    }
}