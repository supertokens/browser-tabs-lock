![SuperTokens banner](https://raw.githubusercontent.com/supertokens/supertokens-logo/master/images/github%20cover.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/supertokens/auth-node-mysql-ref-jwt/blob/master/LICENSE)

# Browser Tabs Lock

Using this package, you can easily get lock functionality across tabs on all modern browsers.

## Some things to note about:
- This is not a reentrant lock. So please do not attempt to acquire a lock on the same key within the same tab if you are already currently holding that lock.
- Theoretically speaking, it is impossible to have foolproof locking built on top of javascript in the browser. One can only make it so that in all practical scenarios, it emulates locking.

## Installation:
```bash
npm i --save browser-tabs-lock
```

### Usage in an async function:
```js
import Lock from "browser-tabs-lock";

let lock = new Lock()
async function lockingIsFun() {
	if (await lock.acquireLock("hello", 5000)) {
		// lock has been acquired... we can do anything we want now.
		// ...
		lock.releaseLock("hello");
	} else {
		// failed to acquire lock after trying for 5 seconds. 
	}
}
```

### Usage using callbacks:

```js
import Lock from "browser-tabs-lock";

let lock = new Lock()
lock.acquireLock("hello", 5000).then((success) => {
	if (success) {
		// lock has been acquired... we can do anything we want now.
		// ...
		lock.releaseLock("hello");
	} else {
		// failed to acquire lock after trying for 5 seconds. 
	}
});
```


Also note, that if your web app only needs to work on google chrome, you can use the [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Lock) instead. This probably has true locking!

## Support, questions and bugs
For now, we are most reachable via team@supertokens.io and via the GitHub issues feature

## Authors
Created with :heart: by the folks at SuperTokens. We are a startup passionate about security and solving software challenges in a way that's helpful for everyone! Please feel free to give us feedback at team@supertokens.io, until our website is ready :grinning:
