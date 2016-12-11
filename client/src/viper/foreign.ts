export type JobStatus = "succeeded" | "failed" | "running" | "queued";

export interface JobJson {
    path: string[],
    builds: BuildJson[],
}

export interface BuildJson {
    id: number,
    status: JobStatus,
}