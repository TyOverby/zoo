import {ZooState, LoadedQueueState, LoadingQueueState, FailedQueueState} from "./state";
import {QueueView} from "./components/queue";
import * as React from "react";
import {ZooAction} from "./actions"

export default function render(state: ZooState, dispatch: (action: ZooAction) => void): React.ReactElement<any> {
    let all = []

    for (const name of Object.keys(state.queues)) {
        const q = state.queues[name];
        if (!state.filter.branch[q.branch]) {
            continue;
        }
        if (!state.filter.prtest && q.name.indexOf("prtest") !== -1) {
            continue;
        }
        const key = q.name;

        switch (q.status) {
            case 'loading':
                all.push(<div key={key} className="loading"> <h1> {key}: Loading </h1> </div>);
                break;
            case 'failed':
                all.push(<div key={key}> <h1> Failed </h1> <span> {q.error} </span> </div>)
                break;
            case 'loaded':
                let qq = {runs: q.runs, ...q};
                all.push(<QueueView key={key} dispatch={dispatch} {...qq}> </QueueView>)
                break;
        }
    }

    let pr_toggle_text = state.filter.prtest ? "Hide" : "Show";

    return (
        <div>
            <div id="filters">
                <button className="collapse-button" onClick={() => dispatch({type: 'COLLAPSE_ALL'})}>Collapse All</button>
                <button className="collapse-button" onClick={() => dispatch({type: 'EXPAND_ALL'})}>Expand All</button>
                <button id="hide-pr" onClick={() => dispatch({type: 'TOGGLE_PR'})}>{pr_toggle_text} PR Queues</button>
            </div>
            <div id="queue-container"> {all} </div>
        </div>)
}
