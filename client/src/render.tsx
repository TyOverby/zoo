import * as state from "./state";
import * as React from "react";
import {QueueView} from "./components/queue";

export default function render(state: state.AppState): JSX.Element {
    let all = state.queues.map(q => <QueueView {...q}> </QueueView>);
    return <div> {all} </div>
}