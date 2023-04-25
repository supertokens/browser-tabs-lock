import getProcessLock from './processLock';

/**
 * @author: SuperTokens (https://github.com/supertokens)
 * This library was created as a part of a larger project, SuperTokens(https://supertokens.io) - the best session management solution.
 * You can also check out our other projects on https://github.com/supertokens
 * 
 * To contribute to this package visit https://github.com/supertokens/browser-tabs-lock
 * If you face any problems you can file an issue on https://github.com/supertokens/browser-tabs-lock/issues
 * 
 * If you have any questions or if you just want to say hi visit https://supertokens.io/discord
 */


/**
 * @constant
 * @type {string}
 * @default
 * @description All the locks taken by this package will have this as prefix
*/
const LOCK_STORAGE_KEY = 'browser-tabs-lock-key';

declare let setTimeout: any;
declare let window: any;
declare let clearTimeout: any;

export type StorageHandler = {
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

const DEFAULT_STORAGE_HANDLER: StorageHandler = {
    key: async (index: number) => {
        throw new Error("Unsupported");
    },
    getItem: async (key: string) => {
        throw new Error("Unsupported");
    },
    clear: async () => {
        return window.localStorage.clear();
    },
    removeItem: async (key: string) => {
        throw new Error("Unsupported");
    },
    setItem: async (key: string, value: string) => {
        throw new Error("Unsupported");
    },
    keySync: (index: number) => {
        return window.localStorage.key(index);
    },
    getItemSync: (key: string) => {
        return window.localStorage.getItem(key);
    },
    clearSync: () => {
        return window.localStorage.clear();
    },
    removeItemSync: (key: string) => {
        return window.localStorage.removeItem(key);
    },
    setItemSync: (key: string, value: string) => {
        return window.localStorage.setItem(key, value);
    },

}

/**
 * @function delay
 * @param {number} milliseconds - How long the delay should be in terms of milliseconds
 * @returns {Promise<void>} 
 */
function delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * @function generateRandomString
 * @params {number} length - How long the random string should be
 * @returns {string}
 * @description returns random string whose length is equal to the length passed as parameter
 */
function generateRandomString(length: number): string {
    const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let randomstring = '';
    for (let i = 0; i < length; i++) {
        const INDEX = Math.floor(Math.random() * CHARS.length);
        randomstring += CHARS[INDEX];
    }
    return randomstring;
}

/**
 * @function getLockId
 * @returns {string}
 * @description Generates an id which will be unique for the browser tab
 */
function getLockId(): string {
    return Date.now().toString() + generateRandomString(15)
}

export default class SuperTokensLock {
    private static waiters: Array<any> | undefined = undefined;
    private id: string;
    private acquiredIatSet: Set<String> = new Set<String>();
    private storageHandler: StorageHandler | undefined = undefined;

    constructor(storageHandler?: StorageHandler) {
        this.id = getLockId();
        this.acquireLock = this.acquireLock.bind(this);
        this.releaseLock = this.releaseLock.bind(this);
        this.releaseLock__private__ = this.releaseLock__private__.bind(this);
        this.waitForSomethingToChange = this.waitForSomethingToChange.bind(this);
        this.refreshLockWhileAcquired = this.refreshLockWhileAcquired.bind(this);
        this.storageHandler = storageHandler;
        if (SuperTokensLock.waiters === undefined) {
            SuperTokensLock.waiters = [];
        }
    }

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
    async acquireLock(lockKey: string, timeout: number = 5000) {
        let iat = Date.now() + generateRandomString(4);
        const MAX_TIME = Date.now() + timeout;
        const STORAGE_KEY = `${LOCK_STORAGE_KEY}-${lockKey}`;
        const STORAGE: StorageHandler = this.storageHandler === undefined ? DEFAULT_STORAGE_HANDLER : this.storageHandler;
        while (Date.now() < MAX_TIME) {
            await delay(30);
            let lockObj = STORAGE.getItemSync(STORAGE_KEY);
            if (lockObj === null) {
                const TIMEOUT_KEY = `${this.id}-${lockKey}-${iat}`;
                // there is a problem if setItem happens at the exact same time for 2 different processes.. so we add some random delay here.
                await delay(Math.floor(Math.random() * 25));
                STORAGE.setItemSync(STORAGE_KEY, JSON.stringify({
                    id: this.id,
                    iat,
                    timeoutKey: TIMEOUT_KEY,
                    timeAcquired: Date.now(),
                    timeRefreshed: Date.now()
                }));
                await delay(30);    // this is to prevent race conditions. This time must be more than the time it takes for storage.setItem
                let lockObjPostDelay = STORAGE.getItemSync(STORAGE_KEY);
                if (lockObjPostDelay !== null) {
                    let parsedLockObjPostDelay = JSON.parse(lockObjPostDelay);
                    if (parsedLockObjPostDelay.id === this.id && parsedLockObjPostDelay.iat === iat) {
                        this.acquiredIatSet.add(iat);
                        this.refreshLockWhileAcquired(STORAGE_KEY, iat);
                        return true;
                    }
                }
            } else {
                SuperTokensLock.lockCorrector(this.storageHandler === undefined ? DEFAULT_STORAGE_HANDLER : this.storageHandler);
                await this.waitForSomethingToChange(MAX_TIME);

            }
            iat = Date.now() + generateRandomString(4);
        }
        return false;
    }

    private async refreshLockWhileAcquired(storageKey: string, iat: string) {
        setTimeout(async () => {
            await getProcessLock().lock(iat);
            if (!this.acquiredIatSet.has(iat)) {
                getProcessLock().unlock(iat);
                return;
            }
            const STORAGE: StorageHandler = this.storageHandler === undefined ? DEFAULT_STORAGE_HANDLER : this.storageHandler;
            let lockObj = STORAGE.getItemSync(storageKey);
            if (lockObj !== null) {
                let parsedLockObj = JSON.parse(lockObj);
                parsedLockObj.timeRefreshed = Date.now();
                STORAGE.setItemSync(storageKey, JSON.stringify(parsedLockObj));
                getProcessLock().unlock(iat);
            } else {
                getProcessLock().unlock(iat);
                return;
            }
            this.refreshLockWhileAcquired(storageKey, iat);
        }, 1000);
    }

    private async waitForSomethingToChange(MAX_TIME: number) {
        await new Promise(resolve => {
            let resolvedCalled = false;
            let startedAt = Date.now();
            const MIN_TIME_TO_WAIT = 50;    // ms
            let removedListeners = false;
            function stopWaiting() {
                if (!removedListeners) {
                    window.removeEventListener('storage', stopWaiting);
                    SuperTokensLock.removeFromWaiting(stopWaiting);
                    clearTimeout(timeOutId);
                    removedListeners = true;
                }
                if (!resolvedCalled) {
                    resolvedCalled = true;
                    let timeToWait = MIN_TIME_TO_WAIT - (Date.now() - startedAt);
                    if (timeToWait > 0) {
                        setTimeout(resolve, timeToWait);
                    } else {
                        resolve(null);
                    }
                }
            }
            window.addEventListener('storage', stopWaiting);
            SuperTokensLock.addToWaiting(stopWaiting);
            let timeOutId = setTimeout(stopWaiting, Math.max(0, MAX_TIME - Date.now()));
        });
    }

    private static addToWaiting(func: any) {
        this.removeFromWaiting(func);
        if (SuperTokensLock.waiters === undefined) {
            return;
        }
        SuperTokensLock.waiters.push(func);
    }

    private static removeFromWaiting(func: any) {
        if (SuperTokensLock.waiters === undefined) {
            return;
        }
        SuperTokensLock.waiters = SuperTokensLock.waiters.filter(i => i !== func);
    }

    private static notifyWaiters() {
        if (SuperTokensLock.waiters === undefined) {
            return;
        }
        let waiters = [...SuperTokensLock.waiters];    // so that if Lock.waiters is changed it's ok.
        waiters.forEach(i => i());
    }

    /**
     * @function releaseLock
     * @memberOf Lock
     * @param {string} lockKey - Key for which lock is being released
     * @returns {void}
     * @description Release a lock.
     */
    async releaseLock(lockKey: string) {
        return await this.releaseLock__private__(lockKey);
    }

    /**
     * @function releaseLock
     * @memberOf Lock
     * @param {string} lockKey - Key for which lock is being released
     * @returns {void}
     * @description Release a lock.
     */
    private async releaseLock__private__(lockKey: string) {
        const STORAGE: StorageHandler = this.storageHandler === undefined ? DEFAULT_STORAGE_HANDLER : this.storageHandler;
        const STORAGE_KEY = `${LOCK_STORAGE_KEY}-${lockKey}`;
        let lockObj = STORAGE.getItemSync(STORAGE_KEY);
        if (lockObj === null) {
            return;
        }
        let parsedlockObj = JSON.parse(lockObj);
        if (parsedlockObj.id === this.id) {
            await getProcessLock().lock(parsedlockObj.iat);

            this.acquiredIatSet.delete(parsedlockObj.iat);
            STORAGE.removeItemSync(STORAGE_KEY);

            getProcessLock().unlock(parsedlockObj.iat);

            SuperTokensLock.notifyWaiters();
        }
    }

    /**
     * @function lockCorrector
     * @returns {void}
     * @description If a lock is acquired by a tab and the tab is closed before the lock is
     *              released, this function will release those locks
     */
    private static lockCorrector(storageHandler: StorageHandler) {
        const MIN_ALLOWED_TIME = Date.now() - 5000;
        const STORAGE = storageHandler;
        const KEYS = Object.keys(STORAGE);
        let notifyWaiters = false;
        for (let i = 0; i < KEYS.length; i++) {
            const LOCK_KEY = KEYS[i];
            if (LOCK_KEY.includes(LOCK_STORAGE_KEY)) {
                let lockObj = STORAGE.getItemSync(LOCK_KEY);
                if (lockObj !== null) {
                    let parsedlockObj = JSON.parse(lockObj);
                    if ((parsedlockObj.timeRefreshed === undefined && parsedlockObj.timeAcquired < MIN_ALLOWED_TIME) ||
                        (parsedlockObj.timeRefreshed !== undefined && parsedlockObj.timeRefreshed < MIN_ALLOWED_TIME)) {
                        STORAGE.removeItemSync(LOCK_KEY);
                        notifyWaiters = true;
                    }
                }
            }
        }
        if (notifyWaiters) {
            SuperTokensLock.notifyWaiters();
        }
    }
}
