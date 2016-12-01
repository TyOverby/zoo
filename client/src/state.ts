import {JobStatus} from "./foreign";

export interface AppState {
    queues: Queue[],
}

export interface Queue {
    url: string,
    path: string[],
    runs: Run[],
}

export interface Run{
    id: number,
    status: JobStatus,
}