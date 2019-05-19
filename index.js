/**
 * @constant
 * @type {string}
 * @default
 * @description All the locks taken by this package will have this as prefix
*/
const LOCK_STORAGE_KEY = 'browser-tabs-lock-nijndsffs';

/**
 * @function delay
 * @param {number} milliseconds - How long the delay should be in terms of milliseconds
 * @returns {Promise<void>} 
 */
function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * @function generateRandomString
 * @params {number} length - How long the random string should be
 * @returns {string}
 * @description returns random string whose length is equal to the length passed as parameter
 */
function generateRandomString(length) {
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
function getLockId() {
    return Date.now().toString() + generateRandomString(15)
}

class Lock {

    static waiters = [];

    constructor() {
        this.id = getLockId();
        this.acquireLock = this.acquireLock.bind(this);
        this.releaseLock = this.releaseLock.bind(this);
        this.releaseLock__private__ = this.releaseLock__private__.bind(this);
    }

    /**
     * @async
     * @memberOf Lock
     * @function acquireLock
     * @param {string} lockKey - Key for which the lock is being acquired
     * @param {number} [timeout=5000] - Maximum time for which the function will wait to acquire the lock
     * @returns {Promise<boolean>}
     * @description Will return true if lock is being acuired, else false.
     *              Also the lock can be acquired for maximum 10 secs
     */
    async acquireLock(lockKey, timeout = 5000) {
        let iat = Date.now() + generateRandomString(4);
        const MAX_TIME = Date.now() + timeout;
        const STORAGE_KEY = `${LOCK_STORAGE_KEY}-${lockKey}`;
        const STORAGE = window.localStorage;
        while (Date.now() < MAX_TIME) {
            let lockObj = STORAGE.getItem(STORAGE_KEY);
            if (lockObj === null) {
                const TIMEOUT_KEY = `${this.id}-${lockKey}-${iat}`;
                STORAGE.setItem(STORAGE_KEY, JSON.stringify({
                    id: this.id,
                    iat,
                    timeoutKey: TIMEOUT_KEY,
                    timeAcquired: Date.now()
                }));
                await delay(50);    // this is to prevent race conditions. This time must be more than the time it takes for storage.setItem
                let lockObjPostDelay = STORAGE.getItem(STORAGE_KEY);
                if (lockObjPostDelay !== null) {
                    lockObjPostDelay = JSON.parse(lockObjPostDelay);
                    if (lockObjPostDelay.id === this.id && lockObjPostDelay.iat === iat) {
                        window[TIMEOUT_KEY] = setTimeout(() => {
                            this.releaseLock__private__(lockKey, iat);
                        }, 10000);
                        return true;
                    }
                }
            } else {
                lockCorrector();
                await waitForSomethingToChange();
            }
            iat = Date.now() + generateRandomString(4);
        }
        return false;
    }

    waitForSomethingToChange = async () => {
        await new Promise(resolve => {
            let resolvedCalled = false;
            let startedAt = Date.now();
            const MIN_TIME_TO_WAIT = 30;    // ms
            function stopWaiting() {
                if (!resolvedCalled) {
                    window.removeEventListener('storage', localStorageChanged);
                    Lock.removeFromWaiting(thisTabLockChanged);
                    clearTimeout(timeOutId);
                    resolvedCalled = true;
                    resolve();
                }
            }
            function localStorageChanged() {    // this is there for any lock changes in other tabs
                let timeToWait = MIN_TIME_TO_WAIT - (Date.now() - startedAt);
                if (timeToWait > 0) {
                    setTimeout(stopWaiting, timeToWait);
                } else {
                    stopWaiting();
                }
            }
            function thisTabLockChanged() { // this is there for any lock changes in this tab
                let timeToWait = MIN_TIME_TO_WAIT - (Date.now() - startedAt);
                if (timeToWait > 0) {
                    setTimeout(stopWaiting, timeToWait);
                } else {
                    stopWaiting();
                }
            }
            window.addEventListener('storage', localStorageChanged);
            Lock.addToWaiting(thisTabLockChanged);
            let timeOutId = setTimeout(stopWaiting, Math.max(0, MAX_TIME - Date.now()));
        });
    }

    static addToWaiting = (func) => {
        this.removeFromWaiting(func);
        Lock.waiters.push(func);
    }

    static removeFromWaiting = (func) => {
        Lock.waiters = Lock.waiters.filter((i) => {
            return i !== func
        });
    }

    static notifyWaiters = () => {
        let waiters = [...Lock.waiters];    // so that if Lock.waiters is changed it's ok.
        waiters.forEach(i => i());
    }

    /**
     * @function releaseLock
     * @memberOf Lock
     * @param {string} lockKey - Key for which lock is being released
     * @returns {void}
     * @description Release a lock.
     */
    releaseLock(lockKey) {
        return this.releaseLock__private__(lockKey);
    }

    /**
     * @function releaseLock
     * @memberOf Lock
     * @param {string} lockKey - Key for which lock is being released
     * @param {number} [iat=null] - Will not be null only if called via setTimeout from acquireLock
     * @returns {void}
     * @description Release a lock.
     */
    releaseLock__private__(lockKey, iat = null) {
        const STORAGE = window.localStorage;
        const STORAGE_KEY = `${LOCK_STORAGE_KEY}-${lockKey}`;
        let lockObj = STORAGE.getItem(STORAGE_KEY);
        if (lockObj === null) {
            return;
        }
        lockObj = JSON.parse(lockObj);
        if (lockObj.id === this.id && (iat === null || lockObj.iat === iat)) {
            STORAGE.removeItem(STORAGE_KEY);
            clearTimeout(window[lockObj.timeoutKey]);
            Lock.notifyWaiters();
        }
    }
}

/**
 * @function lockCorrector
 * @returns {void}
 * @description If a lock is acquired by a tab and the tab is closed before the lock is
 *              released, this function will release those locks
 */
function lockCorrector() {
    const MIN_ALLOWED_TIME = Date.now() - 10000;
    const STORAGE = window.localStorage;
    const KEYS = Object.keys(STORAGE);
    let notifyWaiters = false;
    for (let i = 0; i < KEYS.length; i++) {
        const LOCK_KEY = KEYS[i];
        if (LOCK_KEY.includes(LOCK_STORAGE_KEY)) {
            let lockObj = STORAGE.getItem(LOCK_KEY);
            if (lockObj !== null) {
                lockObj = JSON.parse(lockObj);
                if (lockObj.timeAcquired < MIN_ALLOWED_TIME) {
                    STORAGE.removeItem(LOCK_KEY);
                    notifyWaiters = true;
                }
            }
        }
    }
    if (notifyWaiters) {
        Lock.notifyWaiters();
    }
}

module.exports = Lock;
