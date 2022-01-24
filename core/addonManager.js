const fs = require("fs")
const path = require("path")
const DataStore = require("./datastore")
const request = require("./request")
const { compileString } = require("sass")

const DrDiscord = DataStore("DR_DISCORD_SETTINGS")
DrDiscord.enabledThemes = DrDiscord.enabledThemes || {}
DrDiscord.enabledPlugins = DrDiscord.enabledPlugins || {}

async function prompt(title, content) {
  const { React, getModule, modal } = DrApi
  const ConfirmationModal = getModule("ConfirmModal").default
  const Button = getModule(["ButtonColors"])
  const { Messages } = getModule(m => m.default?.Messages?.OKAY).default
  const { openModal } = modal.functions
  const Markdown = getModule(m => m.default?.displayName === "Markdown" && m.default.rules).default

  if (!Array.isArray(content)) content = [content]
  content = content.map(c => typeof(c) === "string" ? React.createElement(Markdown, null, c) : c)

  return new Promise((resolve) => {
    openModal(props => {
      if (props.transitionState === 3) resolve(false)
      return React.createElement(ConfirmationModal, Object.assign({
        header: title,
        confirmButtonColor: Button.ButtonColors.BRAND,
        confirmText: "Update",
        cancelText: Messages.CANCEL,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        children: content
      }, props))
    })
  })
}

const filters = {
  themes: /(\.((s|)(c|a)ss))$/,
  sass: /\.s(c|a)ss$/,
  plugins: /(\.(c|m|)(j|t)s(x|))$/
}

const addons = {
  themes: [],
  plugins: []
}
const addonsInit = {
  themes: [],
  plugins: []
}

function readMeta(contents) {
  let meta = {}
  let jsdoc = contents.match(/\/\*\*([\s\S]*?)\*\//)[1]
  for (let ite of jsdoc.match(/\*\s([^\n]*)/g)) {
    ite = ite.replace(/\*( +|)@/, "")
    let split = ite.split(" ")
    let key = split[0]
    let value = split.slice(1).join(" ")
    meta[key] = value
  }
  return meta
}
function updatePlugin(meta, load) {
  request(meta.update, async function(err, res, body) {
    if (err) return console.log(err)
    let newMeta = readMeta(body)
    let version = Number(newMeta.version.replace(/\./g, ""))
    let pluginVersion = Number(meta.version.replace(/\./g, ""))
    if (!(pluginVersion < version)) return load()
    else {
      const data = await prompt(`${meta.name} has an update`, [
        `Do you wanna update ${meta.name} v${meta.version} by ${meta.author}?`
        , "This is shown for user end privacy.", 
      ])
      if (data) await fs.promises.writeFile(path, body)
      const retPlugin = load()
      if (data && retPlugin.onUpdate) retPlugin.onUpdate()
    }
  })
}

const themeDir = path.join(__dirname, "..", "themes")
if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir)

fs.readdir(themeDir, (err, files) => {
  if (err) throw new Error(`Error reading '${themeDir}'`)
  files = files.filter(file => filters.themes.test(file))
  for (const file of files) {
    const filePath = path.join(themeDir, file)
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) throw new Error(`Error reading '${filePath}'`)
      const meta = readMeta(data)
      meta.file = filePath
      if (filters.sass.test(file)) meta.css = compileString(data).css
      else meta.css = data
      addons.themes.push(meta)
      addonsInit.themes.push(() => {
        if (!DrDiscord.enabledThemes[meta.name]) return
        const style = document.createElement("style")
        style.innerHTML = meta.css
        style.setAttribute("dr-theme-id", meta.name)
        document.querySelector("drdiscord").appendChild(style)
      })
    })
  }
})

const Themes = new class {
  get(name) { return addons.themes.find(p => p.name === name) }
  getAll() { return addons.themes }
  getEnabled() { return addons.themes.filter(p => this.isEnabled[p.name]) }
  isEnabled(name) { return DrDiscord.enabledThemes[name] || false }
  enable(name) {
    const meta = this.get(name)
    if (!meta) return
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledThemes", { ...DrDiscord.enabledThemes, [meta.name]: true })
    const style = document.createElement("style")
    style.innerHTML = meta.css
    style.setAttribute("dr-theme-id", meta.name)
    document.querySelector("drdiscord").appendChild(style)
  }
  disable(name) {
    try {
      const meta = this.get(name)
      if (!meta) return
      DataStore.setData("DR_DISCORD_SETTINGS", "enabledThemes", { ...DrDiscord.enabledThemes, [meta.name]: false })
      const ele = document.querySelector(`[dr-theme-id="${meta.name}"]`)
      if (ele) ele.remove()
    } catch (error) {
      console.error(error);
    }
  }
  toggle(name) { return this.isEnabled(name) ? this.disable(name) : this.enable(name) }
  getByFileName(name) { return this.getAll().find(p => p.file.endsWith(name)) }
}

const pluginDir = path.join(__dirname, "..", "plugins")
if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir)

fs.readdir(pluginDir, (err, files) => {
  if (err) throw new Error(`Error reading '${pluginDir}'`)
  files = files.filter(file => filters.plugins.test(file))
  for (const file of files) {
    const filePath = path.join(pluginDir, file)
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) throw new Error(`Error reading '${filePath}'`)
      const meta = readMeta(data)
      meta.file = filePath
      addons.plugins.push(meta)
      addonsInit.plugins.push(() => {
        function load() {
          let plugin = require(filePath)
          if (plugin.default) plugin = plugin.default
          meta.export = plugin
          if (plugin.onLoad) plugin.onLoad()
          if (DrDiscord.enabledPlugins[meta.name]) plugin.onStart()
          return plugin
        }
        if (meta.update) updatePlugin(meta, load)
        else load()
      })
    })
  }
})

const Plugins = new class {
  get(name) { return addons.plugins.find(p => p.name === name) }
  getAll() { return addons.plugins }
  getEnabled() { return addons.plugins.filter(p => this.isEnabled[p.name]) }
  isEnabled(name) { return DrDiscord.enabledPlugins[name] ?? false }
  enable(name) {
    const meta = this.get(name)
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledPlugins", { ...DrDiscord.enabledPlugins, [meta.name]: true })
    meta.export.onStart()
  }
  disable(name) {
    const meta = this.get(name)
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledPlugins", { ...DrDiscord.enabledPlugins, [meta.name]: false })
    meta.export.onStop()
  }
  toggle(name) { return this.isEnabled(name) ? this.disable(name) : this.enable(name) }
  getByFileName(name) { return this.getAll().find(p => p.file.endsWith(name)) }
}


module.exports = {
  readMeta,
  themes: () => {
    for (const theme of addonsInit.themes) theme()
    return {
      getByFileName: (name) => Themes.getByFileName(name),
      get: (name) => Themes.get(name),
      getAll: () => Themes.getAll(),
      getEnabled: () => Themes.getEnabled(),
      isEnabled: (name) => Themes.isEnabled(name),
      enable: (name) => Themes.enable(name),
      disable: (name) => Themes.disable(name),
      toggle: (name) => Themes.toggle(name),
      folder: themeDir
    }
  },
  plugins: () => {
    for (const plugin of addonsInit.plugins) plugin()
    return {
      getByFileName: (name) => Plugins.getByFileName(name),
      get: (name) => Plugins.get(name),
      getAll: () => Plugins.getAll(),
      getEnabled: () => Plugins.getEnabled(),
      isEnabled: (name) => Plugins.isEnabled(name),
      enable: (name) => Plugins.enable(name),
      disable: (name) => Plugins.disable(name),
      toggle: (name) => Plugins.toggle(name),
      folder: pluginDir
    }
  },
}