import {createStore, Store} from "redux";
import {zooReducer} from "./reducers";

export type ZooState = {
    view: 'viper',
    queues: { [queueName:string]: QueueState },
    errors: {message: string, details: any}[],
    filter: {
        branch: { [branch: string]: number; },
        prtest: boolean,
    }
}

export type LoadedQueueState = {
    status: 'loaded',
    name: string
    url: string,
    path: string[],
    runs: RunState[],
    collapsed: boolean,
    branch: string,
}

export type LoadingQueueState = {
    status: 'loading',
    name: string,
    branch: string,
}

export type FailedQueueState = {
    status: 'failed',
    name: string
    error: string,
    branch: string,
}

export type QueueState = LoadedQueueState | LoadingQueueState | FailedQueueState;

export type RunState = {
    id: number,
    status: 'succeeded' | 'failed' | 'running' | 'queued' | 'aborted',
}