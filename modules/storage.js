import { error, warn } from "../common/logger";

function localStorage() {
  if (!window.localstorage) {
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
  return window.localStorage
}
/**
 * @name getData
 * @param {string} pluginName 
 * @param {string} key 
 * @param {any} defaultValue 
 * @returns data
 */
function getData(pluginName, key, defaultValue = undefined) {
  if (!pluginName || !key) return error("getData", "You need 2 args, 'pluginName', 'key'")
  if (!defaultValue) warn("getData", "You should store a default value")
  const local = localStorage()
  let DrDiscordStorage = JSON.parse(local.getItem("DrDiscordStorage"))
  if (typeof DrDiscordStorage["PluginData"] == "undefined") DrDiscordStorage["PluginData"] = {}
  if (typeof DrDiscordStorage["PluginData"][pluginName] == "undefined") DrDiscordStorage["PluginData"][pluginName] = {}
  local.setItem("DrDiscordStorage", JSON.stringify(DrDiscordStorage))
  return DrDiscordStorage["PluginData"]?.[pluginName]?.[key] ?? defaultValue
}
/**
 * @name setData
 * @param {sting} pluginName 
 * @param {string} key 
 * @param {any} value 
 */
function setData(pluginName, key, value) {
  if (!pluginName || !key || !value) return error("setData", "You need 3 args, 'pluginName', 'key', and 'value'")
  const local = localStorage()
  let DrDiscordStorage = JSON.parse(local.getItem("DrDiscordStorage"))
  if (typeof DrDiscordStorage["PluginData"] == "undefined") DrDiscordStorage["PluginData"] = {}
  if (typeof DrDiscordStorage["PluginData"][pluginName] == "undefined") DrDiscordStorage["PluginData"][pluginName] = {}
  DrDiscordStorage["PluginData"][pluginName][key] = value
  local.setItem("DrDiscordStorage", JSON.stringify(DrDiscordStorage))
}

export default { localStorage: localStorage(),setData, getData }