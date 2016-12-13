import {ZooState} from "./state";
import {QueueView} from "./components/queue";
import * as React from "react";
import {ZooAction} from "./actions"

export default function render(state: ZooState, dispatch: (action: ZooAction) => void): React.ReactElement<any> {
    let all = state.queues.map(q => {
        let key = q.name;
        switch (q.status) {
            case 'loading':
                return <div key={key}> <h1> {key}: Loading </h1> </div>;
            case 'failed':
                return <div key={key}> <h1> Failed </h1> <span> {q.error} </span> </div>
            case 'loaded':
                return <QueueView key={key} dispatch={dispatch} {...q}> </QueueView>
        }
    });
    return <div> {all} </div>
}