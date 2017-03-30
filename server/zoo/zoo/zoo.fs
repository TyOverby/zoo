module Zoo

open Suave
open Option
open Suave.Successful
open Suave.Web
open Suave.Filters
open Suave.Operators
open Suave.Writers
open FSharp.Data
open Suave.Files
open Suave.RequestErrors
open Suave.Logging
open Suave.Utils

open System
open System.Net

open Suave.Sockets
open Suave.Sockets.Control
open Suave.WebSocket

let allConnections: Util.MutexHolder<List<WebSocket>> = Util.MutexHolder List.Empty

let echo (webSocket : WebSocket) =
  ignore(allConnections.MapUpdate (fun old -> webSocket :: old))

  fun cx -> socket {
    let loop = ref true
    while !loop do
      let! msg = webSocket.read()
      match msg with
      | (Text, data, true) ->
        do! webSocket.send Text data true
      | (Ping, _, _) ->
        do! webSocket.send Pong [||] true
      | (Close, _, _) ->
        do! webSocket.send Close [||] true
        loop := false
        ignore(webSocket |> (<>) |> List.filter |> allConnections.MapUpdate)
      | _ -> ()
  }


let app =
    let splitPath (path: string) = path.Split('/')

    let staticFiles =
        Seq.tryItem 1 (Environment.GetCommandLineArgs())
        |> Util.defaultIfNone Environment.CurrentDirectory
        |> System.IO.Path.GetFullPath

    choose [
        path "/websocket" >=> handShake echo
        GET >=> choose [
            pathScan "/api/viper/runs/%s/%s" (fun (domain, jobNames) -> Viper.getJenkinsWeb domain (splitPath jobNames))
            path "/api/viper/cache" >=> setMimeType "text/plain" >=> Viper.cachePrinter
            pathScan "/api/viper/joblist/%s/%s" (fun (domain, jobNames) -> Viper.getJobListWeb domain jobNames)
            Files.browse staticFiles
        ]
    ]

startWebServer defaultConfig app