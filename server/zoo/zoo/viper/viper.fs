module Viper

open Suave
open Option
open Suave.Successful
open Suave.Web
open Suave.Filters
open Suave.Operators
open Suave.Writers
open System
open FSharp.Data

type RunsContext = JsonProvider<"./viper/json-examples/jenkins/queue.json">
type BuildResultContext = JsonProvider<"./viper/json-examples/jenkins/run.json", SampleIsList=true>
type JobListContext = JsonProvider<"./viper/json-examples/jenkins/joblist.json">

type RunStatus =
    | Queued
    | Running
    | Aborted
    | Failed
    | Succeeded with
    override this.ToString() =
        match this with
          | Queued -> "queued"
          | Running -> "running"
          | Aborted -> "aborted"
          | Failed -> "failed"
          | Succeeded -> "succeeded"

type RunResult = {
    Id: int;
    Status: RunStatus;
} with
    override this.ToString() =
        sprintf """{"id": %d, "status": "%s"}""" this.Id (this.Status.ToString())

let cache: Util.MutexHolder<Map<(string * string[]), (Diagnostics.Stopwatch * Map<int, RunResult>)>> = Util.MutexHolder Map.empty

let updateCache domain jobNames n: Async<RunResult[]> =
    let fetchBuildResult path number = async {
        let url = sprintf "https://%s/%s/%d/api/json?pretty=true" domain path number
        let! run = BuildResultContext.AsyncLoad url
        return {
            Id = run.Id;
            Status =
                match (run.Result, run.Building) with
                    | ("SUCCESS", _) -> Succeeded
                    | ("FAILURE", _) -> Failed
                    | ("ABORTED", _) -> Aborted
                    | (_, false) -> Queued
                    | (_, true) -> Running
        }
    }

    async {
        let jobNesting = String.Join("/", jobNames |> Seq.collect (fun x -> ["job"; x]))
        let url = sprintf "https://%s/%s/api/json?pretty=true" domain jobNesting
        let! data = RunsContext.AsyncLoad(url)
        let numbers = data.Builds |> Seq.map (fun b -> b.Number) |> Seq.truncate n
        let! queue = numbers |> Seq.map (fetchBuildResult jobNesting) |> Async.Parallel
        let queueMap = queue |> Seq.map (fun b -> (b.Id , b)) |> Map.ofSeq

        ignore(cache.MapUpdate (fun cache ->
            let key = (domain, Array.ofSeq jobNames)
            let cacheForThisJob =
                match Map.tryFind key cache with
                | Some (_, c) -> Util.mergeMaps c queueMap
                | None -> queueMap
            let stopwatch = System.Diagnostics.Stopwatch.StartNew();
            Map.add key (stopwatch, cacheForThisJob) cache))

        return queue
    }

let getJenkinsWeb domain jobNames: WebPart =
    let intoJson results =
        let pathJson ="[" + String.Join(",", Seq.map (fun x -> "\"" + x + "\"") jobNames) + "]"
        let buildsJson = "[" + String.Join(",", results |> Seq.map (fun x -> x.ToString())) + "]"
        sprintf """{"path": %s, "runs": %s}""" pathJson buildsJson

    fun (x: HttpContext) ->  async {
        // Using the query string, try to parse out a "count" query that will
        // determine how many items to fetch.
        let n = x.request.queryParam "count" |> Util.dechoice |> Option.bind Util.tryParseInt
        // If nothing could be found, default to 10.  Also limit the #-of-items-fetched
        // to 20
        let n = defaultArg n 10 |> min 20
        let! res = match Map.tryFind (domain, jobNames) cache.Snapshot with
                   | Some((stopwatch, results)) when stopwatch.Elapsed < TimeSpan.FromMinutes 30.0 ->
                        results |> Map.toArray |> Array.map snd |> async.Return
                   | _ -> updateCache domain jobNames n
        let res = res |> Seq.truncate n |> intoJson
        return! OK res x
    }

let cachePrinter =
    fun (x: HttpContext) ->
        let cache = cache.Snapshot
        let mutable out = ""
        for (KeyValue((domain, path), (_, v))) in cache do
            out <- out + sprintf "%s | %s\n" domain (String.Join("/", path))
            for (KeyValue(_, result)) in v do
                out <- out + sprintf "\t%s\n" (result.ToString())
        OK out x

let getJobList domain topLevel =
    async {
        let url = (sprintf "https://%s/job/%s/api/json?pretty=true" domain topLevel)
        let! data = JobListContext.AsyncLoad url
        return data.Jobs |> Seq.map (fun j -> j.Url)
                         |> Seq.map (fun j -> j.Split('/'))
                         |> Seq.map (Seq.where (String.IsNullOrEmpty >> not))
                         |> Seq.map (Seq.filter (String.IsNullOrWhiteSpace >> not))
                         |> Seq.map Seq.last
                         |> Array.ofSeq
    }

let getJobListWeb domain topLevel = fun (x: HttpContext) ->  async {
        let wrapInQuotes s = "\"" + s + "\""
        let! list = getJobList domain topLevel
        return! OK ("[" + String.Join(", ", Seq.map wrapInQuotes list) + "]") x
    }
