import SuperTokensLock from "./index";

var getInstance = () => {
    return new SuperTokensLock();
}

export {getInstance};