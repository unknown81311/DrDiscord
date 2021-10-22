function localStorage() {
  if (window.localStorage === undefined) {
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

function getData(pluginName, key, defaultValue) {
  const local = localStorage()
  let DrDiscordStorage = JSON.parse(local.getItem("DrDiscordStorage"))
  if (typeof DrDiscordStorage["PluginData"] == "undefined") DrDiscordStorage["PluginData"] = {}
  if (typeof DrDiscordStorage["PluginData"][pluginName] == "undefined") DrDiscordStorage["PluginData"][pluginName] = {}
  local.setItem("DrDiscordStorage", JSON.stringify(DrDiscordStorage))
  return DrDiscordStorage["PluginData"]?.[pluginName]?.[key] ?? defaultValue
}
function setData(pluginName, key, value) {
  const local = localStorage()
  let DrDiscordStorage = JSON.parse(local.getItem("DrDiscordStorage"))
  if (typeof DrDiscordStorage["PluginData"] == "undefined") DrDiscordStorage["PluginData"] = {}
  if (typeof DrDiscordStorage["PluginData"][pluginName] == "undefined") DrDiscordStorage["PluginData"][pluginName] = {}
  DrDiscordStorage["PluginData"][pluginName][key] = value
  local.setItem("DrDiscordStorage", JSON.stringify(DrDiscordStorage))
}

const storage = {
  localStorage: localStorage(),
  setData, getData
}
export default storage