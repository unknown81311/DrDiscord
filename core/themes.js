const _fs = require("fs")
const _path = require("path")
const DataStore = require("./datastore")
const { renderSync } = require("sass")

const DrDiscord = DataStore("DR_DISCORD_SETTINGS")

if (!DrDiscord.enabledThemes) DrDiscord.enabledThemes = {}

const _dir = _path.join(__dirname, "..", "themes")
const themes = []

_fs.readdir(_dir, (err, files) => {
  if (err) throw new Error(`Error reading '${_dir}'`)
  files = files.filter(file => file.endsWith(".css") || file.endsWith(".scss"))
  for (const file of files) {
    _fs.readFile(_path.join(_dir, file), "utf8", (err, data) => {
      if (err) throw new Error(`Error reading '${_path.join(_dir, file)}'`)
      let meta = JSON.parse(data.split("\n")[0].replace("/*", "").replace("*/", ""))
      if (file.endsWith(".scss")) {
        meta.scss = true
        meta.css = renderSync({ data }).css.toString()
      }
      else meta.css = data
      themes.push({ meta })
      if (DrDiscord.enabledThemes[meta.name]) document.querySelector("drdiscord").appendChild(Object.assign(document.createElement("style"), {
        innerHTML: meta.css,
        id: `drdiscord-theme-${meta.name.replace(/[^a-z0-9]/gi, "")}`
      }))
    })
  }
})

const Themes = new class {
  get enabledThemes() { return DataStore.getData("DR_DISCORD_SETTINGS", "enabledThemes") }
  get(name) { return themes.find(p => p.meta.name === name) }
  getAll() { return themes }
  getEnabled() { return themes.filter(p => this.isEnabled[p.meta.name]) }
  isEnabled(name) { return this.enabledThemes[name] || false }
  getDisabled() { return themes.filter(p => !this.isEnabled[p.meta.name]) }
  enable(name) {
    const { meta } = Themes.get(name)
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledThemes", { ...this.enabledThemes, [meta.name]: true })
    document.querySelector("drdiscord").appendChild(Object.assign(document.createElement("style"), {
      innerHTML: meta.css,
      id: `drdiscord-theme-${meta.name.replace(/[^a-z0-9]/gi, "")}`
    }))
  }
  disable(name) {
    const { meta } = Themes.get(name)
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledThemes", { ...this.enabledThemes, [meta.name]: false })
    document.querySelector(`#drdiscord-theme-${meta.name.replace(/[^a-z0-9]/gi, "")}`).remove()
  }
  toggle(name) { return this.isEnabled(name) ? this.disable(name) : this.enable(name) }
}

module.exports = {
  get: (name) => Themes.get(name),
  getAll: () => Themes.getAll(),
  getEnabled: () => Themes.getEnabled(),
  isEnabled: (name) => Themes.isEnabled(name),
  getDisabled: () => Themes.getDisabled(),
  enable: (name) => Themes.enable(name),
  disable: (name) => Themes.disable(name),
  toggle: (name) => Themes.toggle(name)
}