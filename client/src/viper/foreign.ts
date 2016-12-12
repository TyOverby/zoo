export type RunStatus = "succeeded" | "failed" | "running" | "queued";

export interface QueueJson {
    path: string[],
    runs: RunJson[],
}

export interface RunJson {
    id: number,
    status: RunStatus,
}