[![SuperTokens banner](https://raw.githubusercontent.com/supertokens/supertokens-logo/master/images/Artboard%20%E2%80%93%2027%402x.png)](https://supertokens.io)

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://github.com/supertokens/auth-node-mysql-ref-jwt/blob/master/LICENSE)
<a href="https://supertokens.io/discord">
        <img src="https://img.shields.io/discord/603466164219281420.svg?logo=discord"
            alt="chat on Discord"></a>
	    
[![CircleCI](https://circleci.com/gh/supertokens/browser-tabs-lock.svg?style=svg)](https://circleci.com/gh/supertokens/browser-tabs-lock)

# Browser Tabs Lock

Using this package, you can easily get lock functionality across tabs on all modern browsers.

**This library was originally designed to be used as a part of our project - SuperTokens - the most secure session management solution for web and mobile apps. Support us by checking it out [here](https://supertokens.io).**

We are also offering free, one-to-one implementation support:
- Schedule a short call with us on https://calendly.com/supertokens-rishabh.
- Whatsapp us on +91-7021000012 saying “SuperTokens”.


## Some things to note about:
- This is not a reentrant lock. So please do not attempt to re-acquire a lock using the same lock instance with the same key without releasing the acquired lock / key first. 
- Theoretically speaking, it is impossible to have foolproof locking built on top of javascript in the browser. One can only make it so that in all practical scenarios, it emulates locking.

## Installation using Node:
```bash
npm i --save browser-tabs-lock
```

### Usage in an async function:
```js
import SuperTokensLock from "browser-tabs-lock";

let superTokensLock = new SuperTokensLock()
async function lockingIsFun() {
	if (await superTokensLock.acquireLock("hello", 5000)) {
		// lock has been acquired... we can do anything we want now.
		// ...
		await superTokensLock.releaseLock("hello");
	} else {
		// failed to acquire lock after trying for 5 seconds. 
	}
}
```

### Usage using callbacks:

```js
import SuperTokensLock from "browser-tabs-lock";

let superTokensLock = new SuperTokensLock()
superTokensLock.acquireLock("hello", 5000).then((success) => {
	if (success) {
		// lock has been acquired... we can do anything we want now.
		// ...
		superTokensLock.releaseLock("hello").then(() => {
			// lock released, continue
		});
	} else {
		// failed to acquire lock after trying for 5 seconds. 
	}
});
```

## Installation using plain JS

As of version 1.2.0 of browser-tabs-lock the package can also be used as in plain javascript script.

### Add the script

```html
<script
	type="text/javascript"
	src="https://cdn.jsdelivr.net/gh/supertokens/browser-tabs-lock@1.2/bundle.js">
</script>
```

### Creating and using the lock

```js
let lock = new supertokenslock.getNewInstance();
lock.acquireLock("hello")
	.then(success => {
		if (success) {
			// lock has been acquired... we can do anything we want now.
			...
			lock.releaseLock("hello").then(() => {
				// lock released, continue
			});
		} else {
			// failed to acquire lock after trying for 5 seconds. 
		}
});
```


Also note, that if your web app only needs to work on google chrome, you can use the [Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Lock) instead. This probably has true locking!

## Migrating from 1.1x to 1.2x

In some cases, version 1.1x did not entirely ensure mutual exclusion. To explain the problem:

Lets say you create two lock instances L1 and L2. L1 acquires a lock with key K1 and is performing some action that takes 20 seconds to finish.

Immediately after L1 acquires a lock, L2 tries to acquire a lock with the same key(K1). Normally L2 would not be able to acquire the lock until L1 releases it (in this case after 20 seconds) or when the tab that uses L1 is closed abruptly. However it is seen that sometimes L2 is able to acquire the lock automatically after 10 seconds (note that L1 has still not released the lock) - thereby breaking mutual exclusion.

This bug has been fixed and released in version 1.2x of browser-tabs-lock. We highly recommend users to upgrade to 1.2x versions.

After upgrading the only change that requires attention to is that ```lock.releaseLock``` is now an asynchronous function and needs to be handled accordingly.

#### Using async/await

Simply change calls to releaseLock from

```js
lock.releaseLock("hello");
```

to

```js
await lock.releaseLock("hello");
```

#### Using callbacks

Simple change calls to releaseLock from

```js
lock.releaseLock("hello");
```

to

```js
lock.releaseLock("hello")
	.then(() => {
		// continue
	});
```

## Support, questions and bugs
For now, we are most reachable via team@supertokens.io and via the GitHub issues feature

## Authors
Created with :heart: by the folks at [SuperTokens](https://supertokens.io). We are a startup passionate about security and solving software challenges in a way that's helpful for everyone! Please feel free to give us feedback at team@supertokens.io, until our website is ready :grinning:
