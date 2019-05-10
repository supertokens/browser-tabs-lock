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
 * @returns {string}
 * @description returns random string which is 8 characters long
 */
function generateRandomString(length) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let randomstring = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * chars.length);
        randomstring += chars[index];
    }
    return randomstring;
}


/**
 * @function getTabId
 * @returns {string}
 * @description Generates an id which will be unique for the browser tab
 */
function getTabId() {
    return Date.now().toString() + generateRandomString(8)
}

const TAB_ID = getTabId();

/**
 * @async
 * @function acquireLock
 * @param {string} lockKey - Key for which the lock is being acquired
 * @param {number} [timeout=5000] - Maximum time for which the function will wait to acquire the lock
 * @returns {Promise<boolean>}
 * @description Will return true if lock is being acuired, else false.
 *              Also the lock can be acquired for maximum 10 secs
 */
async function acquireLock(lockKey, timeout = 5000) {
    let iat = Date.now() + generateRandomString(4);
    const maxTime = Date.now() + timeout;
    const storageKey = `${LOCK_STORAGE_KEY}-${lockKey}`;
    const storage = window.localStorage;
    while (Date.now() < maxTime) {
        let lockObj = storage.getItem(storageKey);
        if (lockObj === null) {
            const timeoutKey = `${TAB_ID}-${lockKey}-${iat}`;
            storage.setItem(storageKey, JSON.stringify({
                tabId: TAB_ID,
                iat,
                timeoutKey,
                timeAcquired: Date.now()
            }));
            await delay(50);    // this is to prevent race conditions. This time must be more than the time it takes for storage.setItem
            let lockObjPostDelay = storage.getItem(storageKey);
            if (lockObjPostDelay !== null) {
                lockObjPostDelay = JSON.parse(lockObjPostDelay);
                if (lockObjPostDelay.tabId === TAB_ID && lockObjPostDelay.iat === iat) {
                    window[timeoutKey] = setTimeout(() => {
                        releaseLock(lockKey, iat);
                    }, 10000);
                    return true;
                }
            }
        } else {
            lockCorrector();
            await delay(30);
        }
        iat = Date.now() + generateRandomString(4);
    }
    return false;
}

/**
 * @function releaseLock
 * @param {string} lockKey - Key for which lock is being released
 * @param {number} [iat=null] - Will not be null only if called via setTimeout from acquireLock
 * @returns {void}
 * @description Release a lock.
 */
function releaseLock(lockKey, iat = null) {
    const storage = window.localStorage;
    const storageKey = `${LOCK_STORAGE_KEY}-${lockKey}`;
    let lockObj = storage.getItem(storageKey);
    if (lockObj === null) {
        return;
    }
    lockObj = JSON.parse(lockObj);
    if (lockObj.tabId === TAB_ID && (iat === null || lockObj.iat === iat)) {
        const timeoutKey = lockObj.timeoutKey;
        storage.removeItem(storageKey);
        clearTimeout(window[timeoutKey]);
    }
}

/**
 * @function lockCorrector
 * @returns {void}
 * @description If a lock is acquired by a tab and the tab is closed before the lock is
 *              released, this function will release those locks
 */
function lockCorrector() {
    const minAllowedTime = Date.now() - 10000;
    const storage = window.localStorage;
    const keys = Object.keys(storage);
    for (let i = 0; i < keys.length; i++) {
        const lockKey = keys[i];
        if (lockKey.includes(LOCK_STORAGE_KEY)) {
            let lockObj = storage.getItem(lockKey);
            if (lockObj !== null) {
                lockObj = JSON.parse(lockObj);
                if (lockObj.timeAcquired < minAllowedTime) {
                    storage.removeItem(lockKey);
                }
            }
        }
    }
}

module.exports = { acquireLock, releaseLock };
