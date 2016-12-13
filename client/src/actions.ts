import {RunState} from "./state";

export type LoadingQueueAction = {
    type: 'LOADING_QUEUE',
    name: string,
}

export type FailedQueueAction = {
    type: 'FAILED_QUEUE',
    name: string,
    message: string,
}

export type LoadedQueueAction = {
    type: 'LOADED_QUEUE',
    name: string
    url: string,
    path: string[],
    runs: RunState[],
}

export type ToggleQueueCollapseAction = {
    type: 'TOGGLE_COLLAPSE_QUEUE',
    name: string,
}

export type ZooAction = LoadingQueueAction | FailedQueueAction | LoadedQueueAction | ToggleQueueCollapseAction;  