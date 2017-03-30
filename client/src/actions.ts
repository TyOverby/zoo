import {RunState} from "./state";

export type CollapseAllAction = {
    type: 'COLLAPSE_ALL',
}

export type ExpandAllAction = {
    type: 'EXPAND_ALL',
}

export type LoadingQueueAction = {
    type: 'LOADING_QUEUE',
    name: string,
    branch: string,
}

export type NewBranchAction = {
    type: 'NEW_BRANCH',
    branch: string,
}

export type FailedQueueAction = {
    type: 'FAILED_QUEUE',
    name: string,
    message: string,
    branch: string,
}

export type LoadedQueueAction = {
    type: 'LOADED_QUEUE',
    name: string
    url: string,
    path: string[],
    runs: RunState[],
    branch: string,
}

export type ToggleQueueCollapseAction = {
    type: 'TOGGLE_COLLAPSE_QUEUE',
    name: string,
}

export type TogglePr = {
    type: 'TOGGLE_PR',
}

export type ZooAction =
    LoadingQueueAction
    | TogglePr
    | ExpandAllAction
    | CollapseAllAction
    | FailedQueueAction
    | LoadedQueueAction
    | ToggleQueueCollapseAction
    | NewBranchAction;