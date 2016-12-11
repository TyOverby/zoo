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

type RunsContext = JsonProvider<"./json-examples/jenkins/runslist.json">
type BuildResultContext = JsonProvider<"./json-examples/jenkins/buildresult.json", SampleIsList=true>

type RunStatus = Queued | Running | Failed | Succeeded with
    override this.ToString() =
        match this with
          | Queued -> "queued"
          | Running -> "running"
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
        let! run =  BuildResultContext.AsyncLoad(sprintf "http://%s/%s/%d/api/json?pretty=true" domain path number)
        return {
            Id = run.Id;
            Status =
                match run.Result with
                    | "SUCCESS" -> Succeeded
                    | "FAILURE" -> Failed
                    | _ -> Queued
        }
    }

    async {
        let jobNesting = String.Join("/", jobNames |> Seq.collect (fun x -> ["job"; x]))
        let! data = RunsContext.AsyncLoad(sprintf "http://%s/%s/api/json?pretty=true" domain jobNesting)
        let numbers = data.Builds |> Seq.map (fun b -> b.Number) |> Seq.take n
        let! builds = numbers |> Seq.map (fetchBuildResult jobNesting) |> Async.Parallel
        let buildsMap = builds |> Array.map (fun b -> (b.Id , b)) |> Map.ofArray

        ignore(cache.MapUpdate (fun cache ->
            let key = (domain, Array.ofSeq jobNames)
            let cacheForThisJob =
                match Map.tryFind key cache with
                | Some (_, c) -> Util.mergeMaps c buildsMap
                | None -> buildsMap
            let stopwatch = System.Diagnostics.Stopwatch.StartNew();
            Map.add key (stopwatch, cacheForThisJob) cache))

        return builds
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
                   | Some((stopwatch, results)) when stopwatch.Elapsed < TimeSpan.FromMinutes 2.0 ->
                        results |> Map.toArray |> Array.map snd |> async.Return
                   | _ -> updateCache domain jobNames n
        let res = intoJson res
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


(*
let app =
    let splitPath (path: string) = path.Split('/')

    let staticFiles =
        Seq.tryItem 1 (Environment.GetCommandLineArgs())
        |> Util.defaultIfNone Environment.CurrentDirectory
        |> System.IO.Path.GetFullPath

    choose [
        GET >=> choose [
            pathScan "/api/runs/%s/%s" (fun (domain, jobNames) -> getJenkinsWeb domain (splitPath jobNames))
            path "/api/cache" >=> setMimeType "text/plain" >=> cachePrinter
            Files.browse staticFiles
        ]
    ]

startWebServer defaultConfig app
*)