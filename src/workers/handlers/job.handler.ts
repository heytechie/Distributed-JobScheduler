export interface JobHandler{
    execute(payload:unknown,signal:AbortSignal):Promise<void>
}