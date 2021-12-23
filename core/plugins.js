const _fs = require("fs")
const _path = require("path")
const DataStore = require("./datastore")

const topWindow = require("electron").webFrame.top.context

const DrDiscord = DataStore("DR_DISCORD_SETTINGS")

if (!DrDiscord.enabledPlugins) DrDiscord.enabledPlugins = {}

const _dir = _path.join(__dirname, "..", "plugins")
const plugins = []

_fs.readdir(_dir, (err, files) => {
  if (err) throw new Error(`Error reading '${_dir}'`)
  files = files.filter(file => file.endsWith(".js"))
  for (const file of files) {
    const { plugin, meta } = require(_path.join(_dir, file))
    plugins.push({ plugin, meta })

    if (plugin.onLoad) plugin.onLoad()

    if (DrDiscord.enabledPlugins[meta.name]) plugin.onStart()
  }
})

const Plugins = new class {
  get(name) { return plugins.find(p => p.meta.name === name) }
  getAll() { return plugins }
  getEnabled() { return plugins.filter(p => this.isEnabled[p.meta.name]) }
  isEnabled(name) { return DrDiscord.enabledPlugins[name] || false }
  getDisabled() { return plugins.filter(p => !this.isEnabled[p.meta.name]) }
  enable(name) {
    const { plugin, meta } = Plugins.get(name)
    if (!plugin) return
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledPlugins", { ...DrDiscord.enabledPlugins, [meta.name]: true })
    plugin.onStart()
  }
  disable(name) {
    const { plugin, meta } = Plugins.get(name)
    if (!plugin) return
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledPlugins", { ...DrDiscord.enabledPlugins, [meta.name]: false })
    plugin.onStop()
  }
  toggle(name) { return this.isEnabled(name) ? this.disable(name) : this.enable(name) }
}

module.exports = {
  get: (name) => Plugins.get(name),
  getAll: () => Plugins.getAll(),
  getEnabled: () => Plugins.getEnabled(),
  isEnabled: (name) => Plugins.isEnabled(name),
  getDisabled: () => Plugins.getDisabled(),
  enable: (name) => Plugins.enable(name),
  disable: (name) => Plugins.disable(name),
  toggle: (name) => Plugins.toggle(name)
}