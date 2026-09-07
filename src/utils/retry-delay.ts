export function calculateRetryDelay(attempts:number):number{
    const baseDelay = Math.pow(2, attempts) * 1000; // Exponential backoff: 2^attempts * 1000ms
    const maxDelay = baseDelay
    const jitter = Math.random() *maxDelay; // Random jitter between 0 and 1000ms
    return baseDelay + jitter;
}