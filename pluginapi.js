import storage from "./modules/storage";
import { error, log } from "./common/logger";
const { localStorage } = storage

function push(plugin, pluginInfo) {
  if (!plugin) return error("PluginApi", "Plugin is required")
  if (!pluginInfo) return error("PluginApi", "Plugin info is required")
  if (typeof pluginInfo !== "object" || !pluginInfo.name || !pluginInfo.description || !pluginInfo.version || !pluginInfo.author) {
    error("PluginApi", "Plugin info is has to be a object/complete, demo below")
    log("demo", {
      name: "Plugin Name",
      description: "Plugin Description",
      version: "Plugin Version",
      author: "Plugin Author"
    })
    return
  }
  // localStorage.setItem("DrApi-Plugins",   JSON.stringify(JSON.parse(localStorage.getItem("DrApi-Plugins")).push([plugin, pluginInfo])))
  DrApi.plugins[pluginInfo.name] = [plugin, pluginInfo]
  plugin?.onLoad?.()
  plugin?.prototype?.onLoad?.()
}

export { push }