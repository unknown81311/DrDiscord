"use strict"
import logger from "./util/logger"
import webpackmodules from "./modules/webpackmodules"
import discordmodules from "./modules/discordmodules"

/**
 * if "window.unsafeWindow" set window to be "window.unsafeWindow", for tampermonkey
 */
window = typeof(unsafeWindow) === "undefined" ? window : unsafeWindow
/**
 * @module Patcher
 * @version 0.0.1
 */
class Patcher {}
/**
 * @module api
 * @version 0.0.1
 * @private
 */
const api = {
    Logger: new logger,
    WebpackModules: new webpackmodules,
    DiscordModules: new discordmodules,
    localStorage: () => {
        const frame = document.createElement("frame")
        frame.src = "about:blank"
        document.body.appendChild(frame)
        let r = Object.getOwnPropertyDescriptor(frame.contentWindow, "localStorage")
        frame.remove()
        Object.defineProperty(window, "localStorage", r)
        r = window.localStorage
        delete window.localStorage
        return r
    }
}
/**
 * @module DrApi
 * @version 0.0.1
 * @global
 * This is different than api because this is for plugin use and internal use, compared to api being internal use
 */
window.DrApi = {
    name: "Discord Re-envisioned",
    version: "0.0.1",
    Logger: api.Logger,
    WebpackModules: api.WebpackModules,
    DiscordModules: api.DiscordModules,
    localStorage: api.localStorage(),
    api: api
}
/**
 * Ending
 */
api.Logger.log(DrApi.name, "Has fully loaded")