module Zoo

open Suave
open Option
open Suave.Successful
open Suave.Web
open Suave.Filters
open Suave.Operators
open Suave.Writers
open System
open FSharp.Data

let app =
    let splitPath (path: string) = path.Split('/')

    let staticFiles =
        Seq.tryItem 1 (Environment.GetCommandLineArgs())
        |> Util.defaultIfNone Environment.CurrentDirectory
        |> System.IO.Path.GetFullPath

    choose [
        GET >=> choose [
            pathScan "/api/viper/runs/%s/%s" (fun (domain, jobNames) -> Viper.getJenkinsWeb domain (splitPath jobNames))
            path "/api/viper/cache" >=> setMimeType "text/plain" >=> Viper.cachePrinter
            Files.browse staticFiles
        ]
    ]

startWebServer defaultConfig app