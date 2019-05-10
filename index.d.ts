export function acquireLock(lockKey: string, timeout?: number): Promise<boolean>
export function releaseLock(lockKey: string, iat?: string): void