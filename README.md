# Browser Tabs Lock

Using this package, you can easily get lock functionality across tabs on all modern browsers.

## Some things to note about:
- This is not a Reentrant lock. So please do not attempt to acquire a lock on the same key within the same tab if you are already currently holding that lock.
- Theoretically speaking, it is impossible to have foolproof locking built on top of javascript in the browser. One can only make it so that in all practical scenarios, it emulates locking.

## Installation:
```bash
npm i --save browser-tabs-lock
```

### Usage in an async function:
```js
import {acquireLock, releaseLock} from "browser-tabs-lock";

async function lockingIsFun() {
	if (await acquireLock("hello", 5000)) {
		// lock has been acquired... we can do anything we want now.
		// ...
		releaseLock("hello");
	} else {
		// lock failed to acquire after trying to acquire it for 5 seconds. 
	}
}
```

### Usage using callbacks:

```js
import {acquireLock, releaseLock} from "browser-tabs-lock";

acquireLock("hello", 5000).then((success) => {
	if (success) {
		// lock has bee acquired... we can do anything we want now.
		// ...
		releaseLock("hello");
	} else {
		// lock failed to acquire after trying to acquire it for 5 seconds. 
	}
});
```


Also note, that if your web app only needs to work on google chrome, you can use the [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/bash Lock) instead. This probably has true locking!
