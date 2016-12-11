import {JobStatus} from "./foreign";

export interface AppState {
    queues: QueueState[],
}

export enum QueueStateTag {
    Loading,
    Failed,
    Loaded,
}
export type QueueState = QueueLoading | QueueFailed | QueueLoaded;

export interface QueueLoading {
    state: QueueStateTag.Loading,
    name: string,
}

export interface QueueFailed {
    state: QueueStateTag.Failed,
    message: string
    name: string,
}

export interface QueueLoaded {
    state: QueueStateTag.Loaded,
    queue: Queue,
    name: string,
}

export interface Queue {
    url: string,
    path: string[],
    runs: Run[],
}

export interface Run {
    id: number,
    status: JobStatus,
}