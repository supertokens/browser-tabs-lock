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
    const MAX_TIME = Date.now() + timeout;
    const STORAGE_KEY = `${LOCK_STORAGE_KEY}-${lockKey}`;
    const STORAGE = window.localStorage;
    while (Date.now() < MAX_TIME) {
        let lockObj = STORAGE.getItem(STORAGE_KEY);
        if (lockObj === null) {
            const TIMEOUT_KEY = `${TAB_ID}-${lockKey}-${iat}`;
            STORAGE.setItem(STORAGE_KEY, JSON.stringify({
                tabId: TAB_ID,
                iat,
                timeoutKey: TIMEOUT_KEY,
                timeAcquired: Date.now()
            }));
            await delay(50);    // this is to prevent race conditions. This time must be more than the time it takes for storage.setItem
            let lockObjPostDelay = STORAGE.getItem(STORAGE_KEY);
            if (lockObjPostDelay !== null) {
                lockObjPostDelay = JSON.parse(lockObjPostDelay);
                if (lockObjPostDelay.tabId === TAB_ID && lockObjPostDelay.iat === iat) {
                    window[TIMEOUT_KEY] = setTimeout(() => {
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
    const STORAGE = window.localStorage;
    const STORAGE_KEY = `${LOCK_STORAGE_KEY}-${lockKey}`;
    let lockObj = STORAGE.getItem(STORAGE_KEY);
    if (lockObj === null) {
        return;
    }
    lockObj = JSON.parse(lockObj);
    if (lockObj.tabId === TAB_ID && (iat === null || lockObj.iat === iat)) {
        STORAGE.removeItem(STORAGE_KEY);
        clearTimeout(window[lockObj.timeoutKey]);
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
    const KEYS = Object.KEYS(STORAGE);
    for (let i = 0; i < KEYS.length; i++) {
        const LOCK_KEY = KEYS[i];
        if (LOCK_KEY.includes(LOCK_STORAGE_KEY)) {
            let lockObj = STORAGE.getItem(LOCK_KEY);
            if (lockObj !== null) {
                lockObj = JSON.parse(lockObj);
                if (lockObj.timeAcquired < MIN_ALLOWED_TIME) {
                    STORAGE.removeItem(LOCK_KEY);
                }
            }
        }
    }
}

module.exports = { acquireLock, releaseLock };
