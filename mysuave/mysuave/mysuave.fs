open Suave
open Suave.Successful
open Suave.Web
open Suave.Filters
open Suave.Operators
open System
open FSharp.Data

type RunsContext = JsonProvider<"./json-examples/jenkins/runslist.json">
type BuildResultContext = JsonProvider<"./json-examples/jenkins/buildresult.json", SampleIsList=true>

let getJenkins jobNames: WebPart =
    let fetchBuildResult path number = async {
        let! buildResult =  BuildResultContext.AsyncLoad(sprintf "http://dotnet-ci2.cloudapp.net/%s/%d/api/json?pretty=true" path number)
        return sprintf "<li> %d: %s </li>" number buildResult.Result
    }

    fun (x : HttpContext) ->  async {
        let jobNesting = String.Join("/", jobNames |> Seq.collect (fun x -> ["job"; x]))
        let! data = RunsContext.AsyncLoad(sprintf "http://dotnet-ci2.cloudapp.net/%s/api/json?pretty=true" jobNesting)
        let numbers = data.Builds |> Seq.map (fun b -> b.Number) |> Seq.take 10
        let! builds = numbers |> Seq.map (fetchBuildResult jobNesting) |> Async.Parallel
        let result = sprintf "<ul> %s </ul>" (String.Join("", builds))
        return! OK result x
    }

let app =
    let splitPath (path: string) = path.Split('/') |> Seq.ofArray
    choose [
        GET >=> choose [
            pathScan "/api/runs/%s" (splitPath >> getJenkins)
        ]
    ]

startWebServer defaultConfig app