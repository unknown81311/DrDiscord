import logger from "./util/logger"
import info from "./util/info"
import webpackmodules from "./modules/webpackmodules"
import discordmodules from "./modules/discordmodules"
import patcher from "./modules/patcher"

/**
 * if "window.unsafeWindow" set window to be "window.unsafeWindow", for tampermonkey
 */
window = typeof(unsafeWindow) === "undefined" ? window : unsafeWindow
/**
 * @module api
 * @version 0.0.1
 * @private
 */
const api = {
    Logger: new logger,
    WebpackModules: new webpackmodules,
    DiscordModules: new discordmodules,
    Patcher: new patcher,
    Info: new info,
    localStorage: () => {
        const frame = document.createElement("frame")
        frame.src = "about:blank"
        document.body.appendChild(frame)
        let r = Object.defineProperty(window, "localStorage", Object.getOwnPropertyDescriptor(frame.contentWindow, "localStorage"))
        frame.remove()
        r = window.localStorage
        delete window.localStorage
        return r
    }
}
api.Logger.log(`${api.Info.name.short}-Api`, "Has fully loaded")
/**
 * @module DrApi
 * @version 0.0.1
 * @global
 * This is different than api because this is for plugin use and internal use, compared to api being internal use
 */
window.DrApi = {
    info: api.Info,
    Logger: api.Logger,
    WebpackModules: api.WebpackModules,
    DiscordModules: api.DiscordModules,
    Patcher: api.Patcher,
    localStorage: api.localStorage()
}
/**
 * Ending
 */
api.Logger.log(`${api.Info.name.short}-${api.Info.version}`, "Has fully loaded")