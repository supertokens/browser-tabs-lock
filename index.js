/** 
 * @version 1.0.5
 * @module browser-tabs-lock
 * @copyright VRAI Labs Pvt. Ltd. 2019
 * @author Bhumil Sarvaiya <bhumilsarvaiya@gmail.com>
 * @author Rishabh Poddar <rishabhpoddar@gmail.com>
 * @license ISC
*/

/**
 * @constant
 * @type {string}
 * @default
 * @description All the locks taken by this package will have this as prefix
*/
const locksStorageKey = 'browser-tabs-lock';

/** 
 * @constant
 * @type {string}
 * @default
 * @description Acts as pool of charactes used to generate random string
*/
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

/**
 * @function delay
 * @param {number} milliseconds - How long the delay should be in terms of milliseconds
 * @returns {Promise<void>} 
 */
const delay = (milliseconds) => {
    return new Promise( resolve => setTimeout(resolve, milliseconds) );
}

/**
 * @function generateRandomString
 * @returns {string}
 * @description returns random string which is 8 characters long
 */
const generateRandomString = () => {
    let randomstring = '';
    for (let i = 0; i < 8; i++) {
        const index = Math.floor(Math.random() * chars.length);
        randomstring += chars[index];
    }
    return randomstring;
}

/**
 * @class
 * @example
 * const tabId = TabsLock.getTabId();
 * let lockKey = 'lockKey';
 * if (await TabsLock.acquireLock(lockKey, tabId, 8000)) {
 *      // lock acquired
 *      // do something
 *      TabsLock.releaseLock(lockKey, tabId);
 * } else {
 *      // lock was not acquired
 * }
 */
class TabsLock {
    constructor () {}

    /**
     * @function getTabId
     * @memberof TabsLock
     * @returns {string}
     * @static
     * @description Generates an id which will be unique for the browser tab
     */
    static getTabId () {
        return  Date.now().toString() + generateRandomString()
    }
    
    /**
     * @async
     * @function acquireLock
     * @memberof TabsLock
     * @param {string} lockKey - Key for which the lock is being acquired
     * @param {string} tabId - Unique id for the browser tab that is currently trying to acquire the lock
     * @param {number} [timeout=5000] - Maximum time for which the function will wait to acquire the lock
     * @returns {boolean}
     * @static
     * @description Will return true if lock is being acuired, else false.
     *              Also the lock can be acquired for maximum 10 secs
     */
    static async acquireLock (lockKey, tabId, timeout=5000) {
        let currentTime = Date.now();
        const maxTime = currentTime + timeout;
        const storageKey = `${locksStorageKey}-${lockKey}`;
        const storage = window.localStorage;
        while (currentTime < maxTime) {
            let lockObj = storage.getItem(storageKey);
            if (lockObj === null) {
                const timeoutKey = `${tabId}-${lockKey}-${iat}`;
                storage.setItem(storageKey, JSON.stringify({
                    tabId,
                    iat: currentTime,
                    timeoutKey
                }));
                await delay(50);
                let lockObjPostDelay = storage.getItem(storageKey);
                if (lockObjPostDelay !== null) {
                    lockObjPostDelay = JSON.parse(lockObjPostDelay);
                    if (lockObjPostDelay.tabId === tabId && lockObjPostDelay.iat === currentTime) {
                        window[timeoutKey] = setTimeout(() => {
                            this.releaseLock(lockKey, tabId, currentTime);
                        }, 10000);
                        return true;
                    }
                }
            } else {
                this.lockCorrector();
                await delay(30);
            }
            currentTime = Date.now();
        }
        return false;
    }

    /**
     * @function releaseLock
     * @memberof TabsLock
     * @param {string} lockKey - Key for which lock is being released
     * @param {string} tabId - Unique id for the browser tab for which the lock is being released
     * @param {number} [iat=null] - Time at which lock was acquired.
     *                              Will not be null only if called via setTimeout from acquireLock
     * @returns {void}
     * @static
     * @description Release a lock.
     */
    static releaseLock (lockKey, tabId, iat=null) {
        const storage = window.localStorage;
        const storageKey = `${locksStorageKey}-${lockKey}`;
        let lockObj = storage.getItem(storageKey);
        if (lockObj === null) {
            return;
        }
        lockObj = JSON.parse(lockObj);
        if (lockObj.tabId === tabId && (iat === null || lockObj.iat === iat)) {
            const timeoutKey = lockObj.timeoutKey;
            storage.removeItem(storageKey);
            clearTimeout(window[timeoutKey]);
        }
    }

    /**
     * @function lockCorrector
     * @memberof TabsLock
     * @returns {void}
     * @static
     * @description If a lock is acquired by a tab and the tab is closed before the lock is
     *              released, this function will release those locks
     */
    static lockCorrector () {
        const minAllowedTime = Date.now() - 10000;
        const storage = window.localStorage;
        const keys = Object.keys(storage);
        for (let i = 0; i < keys.length; i++) {
            const lockKey = keys[i];
            if (lockKey.includes(locksStorageKey)) {
                let lockObj = storage.getItem(lockKey);
                if (lockObj !== null) {
                    lockObj = JSON.parse(lockObj);
                    if (lockObj.iat < minAllowedTime) {
                        storage.removeItem(lockKey);
                    }
                }
            }
        }
    }
}

module.exports = TabsLock;