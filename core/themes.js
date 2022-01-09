const _fs = require("fs")
const _path = require("path")
const DataStore = require("./datastore")
const { renderSync } = require("sass")

const DrDiscord = DataStore("DR_DISCORD_SETTINGS")

if (!DrDiscord.enabledThemes) DrDiscord.enabledThemes = {}

const _dir = _path.join(__dirname, "..", "themes")

if (!_fs.existsSync(_dir)) _fs.mkdirSync(_dir)

const themes = []

_fs.readdir(_dir, (err, files) => {
  if (err) throw new Error(`Error reading '${_dir}'`)
  files = files.filter(file => file.endsWith(".css") || file.endsWith(".scss"))
  for (const file of files) {
    const path = _path.join(_dir, file)
    _fs.readFile(path, "utf8", (err, data) => {
      if (err) throw new Error(`Error reading '${path}'`)
      let meta = {}
      let jsdoc = data.match(/\/\*\*([\s\S]*?)\*\//)[1]
      for (let ite of jsdoc.match(/\*\s([^\n]*)/g)) {
        ite = ite.replace("* @", "")
        let split = ite.split(" ")
        let key = split[0]
        let value = split.slice(1).join(" ")
        meta[key] = value
      }
      if (file.endsWith(".scss")) {
        meta.scss = true
        meta.css = renderSync({ data }).css.toString()
      }
      else {
        meta.scss = false
        meta.css = data
      }
      meta.file = path
      themes.push({ meta, theme: data })
      if (DrDiscord.enabledThemes[meta.name]) document.querySelector("drdiscord").appendChild(Object.assign(document.createElement("style"), {
        innerHTML: meta.css,
        id: `Dr-theme-${meta.name.replace(/[^a-z0-9]/gi, "")}`
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
      id: `Dr-theme-${meta.name.replace(/[^a-z0-9]/gi, "")}`
    }))
  }
  disable(name) {
    const { meta } = Themes.get(name)
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledThemes", { ...this.enabledThemes, [meta.name]: false })
    document.querySelector(`#Dr-theme-${meta.name.replace(/[^a-z0-9]/gi, "")}`).remove()
  }
  toggle(name) { return this.isEnabled(name) ? this.disable(name) : this.enable(name) }
  getByFileName(name) {
    const all = this.getAll(); 
    const done=false
    for (var i = 0; (i < all.length && !done); i++) {
      const plug=all[i].meta.file.split('\\');
      if(plug[plug.length-1]==name)done==true;
    }
    return(Themes.get(all[i-1].meta.name)||undefined);
  }
}

const watcher = _fs.watch(_dir, {},(_,f)=>{
  const plug = Themes.getByFileName(f)
  if(Themes.isEnabled(plug)){
    Themes.disable(plug)
    Themes.enable(plug)
  }
})

module.exports = {
  getByFileName:(name)=>Themes.getByFileName(name),
  get: (name) => Themes.get(name),
  getAll: () => Themes.getAll(),
  getEnabled: () => Themes.getEnabled(),
  isEnabled: (name) => Themes.isEnabled(name),
  getDisabled: () => Themes.getDisabled(),
  enable: (name) => Themes.enable(name),
  disable: (name) => Themes.disable(name),
  toggle: (name) => Themes.toggle(name),
  folder: _dir
}