"use strict"
import webpackmodules from "./webpackmodules"

/**
 * @module DiscordModules
 * @version 0.0.1
 */
const WebpackModules = new webpackmodules
export default class DiscordModules {
    get React() {return WebpackModules.getByProps("createElement", "cloneElement")}
    get ReactDOM() {return WebpackModules.getByProps("render", "findDOMNode")}
}