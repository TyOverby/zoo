import {AppState, QueueStateTag} from "./state";
import * as React from "react";
import {QueueView} from "../components/queue";

export default function render(state: AppState): React.ReactElement<any> {
    let all = state.queues.map(q => {
        let key = q.name;
        if (q.state === QueueStateTag.Loading) {
            return <div key={key}> <h1> {key}: Loading </h1> </div>;
        } else if (q.state === QueueStateTag.Failed) {
            return <div key={key}> <h1> Failed </h1> <span> {q.message} </span> </div>
        } else if (q.state == QueueStateTag.Loaded) {
            return <QueueView key={key} {...q.queue}> </QueueView>
        }
    });
    return <div> {all} </div>
}