var supertokenslock=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(1);t.getNewInstance=function(){return new r.default}},function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function a(e){try{c(r.next(e))}catch(e){i(e)}}function u(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){e.done?o(e.value):new n((function(t){t(e.value)})).then(a,u)}c((r=r.apply(e,t||[])).next())}))},o=this&&this.__generator||function(e,t){var n,r,o,i,a={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:u(0),throw:u(1),return:u(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function u(i){return function(u){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;a;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return a.label++,{value:i[1],done:!1};case 5:a.label++,r=i[1],i=[0];continue;case 7:i=a.ops.pop(),a.trys.pop();continue;default:if(!(o=(o=a.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){a=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){a.label=i[1];break}if(6===i[0]&&a.label<o[1]){a.label=o[1],o=i;break}if(o&&a.label<o[2]){a.label=o[2],a.ops.push(i);break}o[2]&&a.ops.pop(),a.trys.pop();continue}i=t.call(e,a)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,u])}}},i=this;Object.defineProperty(t,"__esModule",{value:!0});var a=n(2),u={key:function(e){return r(i,void 0,void 0,(function(){return o(this,(function(e){throw new Error("Unsupported")}))}))},getItem:function(e){return r(i,void 0,void 0,(function(){return o(this,(function(e){throw new Error("Unsupported")}))}))},clear:function(){return r(i,void 0,void 0,(function(){return o(this,(function(e){return[2,window.localStorage.clear()]}))}))},removeItem:function(e){return r(i,void 0,void 0,(function(){return o(this,(function(e){throw new Error("Unsupported")}))}))},setItem:function(e,t){return r(i,void 0,void 0,(function(){return o(this,(function(e){throw new Error("Unsupported")}))}))},keySync:function(e){return window.localStorage.key(e)},getItemSync:function(e){return window.localStorage.getItem(e)},clearSync:function(){return window.localStorage.clear()},removeItemSync:function(e){return window.localStorage.removeItem(e)},setItemSync:function(e,t){return window.localStorage.setItem(e,t)}};function c(e){return new Promise((function(t){return setTimeout(t,e)}))}function s(e){for(var t="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",n="",r=0;r<e;r++){n+=t[Math.floor(Math.random()*t.length)]}return n}var l=function(){function e(t){this.acquiredIatSet=new Set,this.storageHandler=void 0,this.id=Date.now().toString()+s(15),this.acquireLock=this.acquireLock.bind(this),this.releaseLock=this.releaseLock.bind(this),this.releaseLock__private__=this.releaseLock__private__.bind(this),this.waitForSomethingToChange=this.waitForSomethingToChange.bind(this),this.refreshLockWhileAcquired=this.refreshLockWhileAcquired.bind(this),this.storageHandler=t,void 0===e.waiters&&(e.waiters=[])}return e.prototype.acquireLock=function(t,n){return void 0===n&&(n=5e3),r(this,void 0,void 0,(function(){var r,i,a,l,d,f,h;return o(this,(function(o){switch(o.label){case 0:r=Date.now()+s(4),i=Date.now()+n,a="browser-tabs-lock-key-"+t,l=void 0===this.storageHandler?u:this.storageHandler,o.label=1;case 1:return Date.now()<i?[4,c(30)]:[3,8];case 2:return o.sent(),null!==l.getItemSync(a)?[3,5]:(d=this.id+"-"+t+"-"+r,[4,c(Math.floor(25*Math.random()))]);case 3:return o.sent(),l.setItemSync(a,JSON.stringify({id:this.id,iat:r,timeoutKey:d,timeAcquired:Date.now(),timeRefreshed:Date.now()})),[4,c(30)];case 4:return o.sent(),null!==(f=l.getItemSync(a))&&(h=JSON.parse(f)).id===this.id&&h.iat===r?(this.acquiredIatSet.add(r),this.refreshLockWhileAcquired(a,r),[2,!0]):[3,7];case 5:return e.lockCorrector(void 0===this.storageHandler?u:this.storageHandler),[4,this.waitForSomethingToChange(i)];case 6:o.sent(),o.label=7;case 7:return r=Date.now()+s(4),[3,1];case 8:return[2,!1]}}))}))},e.prototype.refreshLockWhileAcquired=function(e,t){return r(this,void 0,void 0,(function(){var n=this;return o(this,(function(i){return setTimeout((function(){return r(n,void 0,void 0,(function(){var n,r,i;return o(this,(function(o){switch(o.label){case 0:return[4,a.default().lock(t)];case 1:return o.sent(),this.acquiredIatSet.has(t)?(n=void 0===this.storageHandler?u:this.storageHandler,null===(r=n.getItemSync(e))?(a.default().unlock(t),[2]):((i=JSON.parse(r)).timeRefreshed=Date.now(),n.setItemSync(e,JSON.stringify(i)),a.default().unlock(t),this.refreshLockWhileAcquired(e,t),[2])):(a.default().unlock(t),[2])}}))}))}),1e3),[2]}))}))},e.prototype.waitForSomethingToChange=function(t){return r(this,void 0,void 0,(function(){return o(this,(function(n){switch(n.label){case 0:return[4,new Promise((function(n){var r=!1,o=Date.now(),i=50,a=!1;function u(){if(a||(window.removeEventListener("storage",u),e.removeFromWaiting(u),clearTimeout(c),a=!0),!r){r=!0;var t=i-(Date.now()-o);t>0?setTimeout(n,t):n(null)}}window.addEventListener("storage",u),e.addToWaiting(u);var c=setTimeout(u,Math.max(0,t-Date.now()))}))];case 1:return n.sent(),[2]}}))}))},e.addToWaiting=function(t){this.removeFromWaiting(t),void 0!==e.waiters&&e.waiters.push(t)},e.removeFromWaiting=function(t){void 0!==e.waiters&&(e.waiters=e.waiters.filter((function(e){return e!==t})))},e.notifyWaiters=function(){void 0!==e.waiters&&e.waiters.slice().forEach((function(e){return e()}))},e.prototype.releaseLock=function(e){return r(this,void 0,void 0,(function(){return o(this,(function(t){switch(t.label){case 0:return[4,this.releaseLock__private__(e)];case 1:return[2,t.sent()]}}))}))},e.prototype.releaseLock__private__=function(t){return r(this,void 0,void 0,(function(){var n,r,i,c;return o(this,(function(o){switch(o.label){case 0:return n=void 0===this.storageHandler?u:this.storageHandler,r="browser-tabs-lock-key-"+t,null===(i=n.getItemSync(r))?[2]:(c=JSON.parse(i)).id!==this.id?[3,2]:[4,a.default().lock(c.iat)];case 1:o.sent(),this.acquiredIatSet.delete(c.iat),n.removeItemSync(r),a.default().unlock(c.iat),e.notifyWaiters(),o.label=2;case 2:return[2]}}))}))},e.lockCorrector=function(t){for(var n=Date.now()-5e3,r=t,o=[],i=0;;){var a=r.keySync(i);if(null===a)break;o.push(a),i++}for(var u=!1,c=0;c<o.length;c++){var s=o[c];if(s.includes("browser-tabs-lock-key")){var l=r.getItemSync(s);if(null!==l){var d=JSON.parse(l);(void 0===d.timeRefreshed&&d.timeAcquired<n||void 0!==d.timeRefreshed&&d.timeRefreshed<n)&&(r.removeItemSync(s),u=!0)}}}u&&e.notifyWaiters()},e.waiters=void 0,e}();t.default=l},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(){var e=this;this.locked=new Map,this.addToLocked=function(t,n){var r=e.locked.get(t);void 0===r?void 0===n?e.locked.set(t,[]):e.locked.set(t,[n]):void 0!==n&&(r.unshift(n),e.locked.set(t,r))},this.isLocked=function(t){return e.locked.has(t)},this.lock=function(t){return new Promise((function(n,r){e.isLocked(t)?e.addToLocked(t,n):(e.addToLocked(t),n())}))},this.unlock=function(t){var n=e.locked.get(t);if(void 0!==n&&0!==n.length){var r=n.pop();e.locked.set(t,n),void 0!==r&&setTimeout(r,0)}else e.locked.delete(t)}}return e.getInstance=function(){return void 0===e.instance&&(e.instance=new e),e.instance},e}();t.default=function(){return r.getInstance()}}]);