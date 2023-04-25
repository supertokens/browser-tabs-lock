export declare type StorageHandler = {
    key: (index: number) => Promise<string | null>;
    getItem: (key: string) => Promise<string | null>;
    clear: () => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    setItem: (key: string, value: string) => Promise<void>;
    /**
     * Sync versions of the storage functions
     */
    keySync: (index: number) => string | null;
    getItemSync: (key: string) => string | null;
    clearSync: () => void;
    removeItemSync: (key: string) => void;
    setItemSync: (key: string, value: string) => void;
};
export default class SuperTokensLock {
    private static waiters;
    private id;
    private acquiredIatSet;
    private storageHandler;
    constructor(storageHandler?: StorageHandler);
    /**
     * @async
     * @memberOf Lock
     * @function acquireLock
     * @param {string} lockKey - Key for which the lock is being acquired
     * @param {number} [timeout=5000] - Maximum time for which the function will wait to acquire the lock
     * @returns {Promise<boolean>}
     * @description Will return true if lock is being acquired, else false.
     *              Also the lock can be acquired for maximum 10 secs
     */
    acquireLock(lockKey: string, timeout?: number): Promise<boolean>;
    private refreshLockWhileAcquired;
    private waitForSomethingToChange;
    private static addToWaiting;
    private static removeFromWaiting;
    private static notifyWaiters;
    /**
     * @function releaseLock
     * @memberOf Lock
     * @param {string} lockKey - Key for which lock is being released
     * @returns {void}
     * @description Release a lock.
     */
    releaseLock(lockKey: string): Promise<void>;
    /**
     * @function releaseLock
     * @memberOf Lock
     * @param {string} lockKey - Key for which lock is being released
     * @returns {void}
     * @description Release a lock.
     */
    private releaseLock__private__;
    /**
     * @function lockCorrector
     * @returns {void}
     * @description If a lock is acquired by a tab and the tab is closed before the lock is
     *              released, this function will release those locks
     */
    private static lockCorrector;
}
