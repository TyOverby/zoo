import {createStore, Store} from "redux";
import {zooReducer} from "./reducers";

export type ZooState = {
    view: 'viper',
    queues: QueueState[],
    errors: {message: string, details: any}[],
}

export type LoadedQueueState = {
    status: 'loaded',
    name: string
    url: string,
    path: string[],
    runs: RunState[],
    collapsed: boolean,
}

export type QueueState =  LoadedQueueState |
{
    status: 'loading',
    name: string
} | {
    status: 'failed',
    name: string
    error: string,
};

export type RunState = {
    id: number,
    status: 'succeeded' | 'failed' | 'running' | 'queued',
}