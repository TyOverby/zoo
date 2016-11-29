module Util

let dechoice c =
    match c with
    | Choice1Of2 t -> Some t
    | Choice2Of2 (_) -> None

let tryParseInt s =
    match System.Int32.TryParse(s) with
    | (true,int) -> Some(int)
    | _ -> None

let mergeMaps m1 m2 =
    Map(Seq.concat [ (Map.toSeq m1) ; (Map.toSeq m2) ])


type MutexHolder<'a>(value: 'a) =
    let mutable value = value
    let mutex = new System.Threading.ReaderWriterLockSlim()

    member this.Snapshot = value

    member this.MapUpdate f =
        try
            ignore (mutex.EnterWriteLock())
            value <- f value
            value
        finally
            ignore (mutex.ExitWriteLock())
    member this.Map f =
        try
            ignore (mutex.EnterReadLock())
            f value
        finally
            ignore (mutex.ExitReadLock())
