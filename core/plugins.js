const _fs = require("fs")
const _path = require("path")
const DataStore = require("./datastore")

const DrDiscord = DataStore("DR_DISCORD_SETTINGS")

if (!DrDiscord.enabledPlugins) DrDiscord.enabledPlugins = {}

const _dir = _path.join(__dirname, "..", "plugins")
const plugins = []

if (!_fs.existsSync(_dir)) _fs.mkdirSync(_dir)

function readMeta(contents) {
  let meta = {}
  let jsdoc = contents.match(/\/\*\*([\s\S]*?)\*\//)[1]
  for (let ite of jsdoc.match(/\*\s([^\n]*)/g)) {
    ite = ite.replace("* @", "")
    let split = ite.split(" ")
    let key = split[0]
    let value = split.slice(1).join(" ")
    meta[key] = value
  }
  return meta
}

async function prompt(title, content) {
  const ConfirmationModal = DrApi.getModule("ConfirmModal").default
  const Button = DrApi.getModule(["ButtonColors"])
  const { Messages } = DrApi.getModule(m => m.default?.Messages?.OKAY).default
  const { openModal } = DrApi.modal.functions
  const { React } = DrApi
  const Markdown = DrApi.getModule(m => m.default?.displayName === "Markdown" && m.default.rules).default

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

let mention = DrApi.getModule("UserMention").default
const Markdown = DrApi.getModule(m => m.default?.displayName === "Markdown" && m.default.rules).default
const Flex = DrApi.getModule("Flex").default
let { React } = DrApi

_fs.readdir(_dir, (err, files) => {
  if (err) throw new Error(`Error reading '${_dir}'`)
  files = files.filter(file => file.endsWith(".js"))
  for (const file of files) {
    const path = _path.join(_dir, file)
    let meta = readMeta(_fs.readFileSync(path, "utf8"))
    if (meta.ignore === "true") return
    meta.file = path
    function load() {
      const plugin = require(path)
      plugins.push({ plugin, meta })
      if (plugin.onLoad) plugin.onLoad()
      if (DrDiscord.enabledPlugins[meta.name]) plugin.onStart()
      return plugin
    }
    if (meta.update) DrApi.request(meta.update, async function(err, res, body) {
      if (err) return console.log(err)
      let newMeta = readMeta(body)
      let version = Number(newMeta.version.replace(/\./g, ""))
      let pluginVersion = Number(meta.version.replace(/\./g, ""))
      // if version is higher than plugin version then update else do nothing
      if (!(pluginVersion < version)) return load()
      else {
        const data = await prompt(`${meta.name} has an update`, [
          `Do you wanna update ${meta.name} v${meta.version} by ${meta.author}?`
          , "This is shown for user end privacy.", 
        ])
        if (data) await _fs.promises.writeFile(path, body)
        const retPlugin = load()
        if (data && retPlugin.onUpdate) retPlugin.onUpdate()
      }
    })
    else load()
  }
})

const Plugins = new class {
  get enabledPlugins() { return DataStore.getData("DR_DISCORD_SETTINGS", "enabledPlugins") }
  get(name) { return plugins.find(p => p.meta.name === name) }
  getAll() { return plugins }
  getEnabled() { return plugins.filter(p => this.isEnabled[p.meta.name]) }
  isEnabled(name) { return this.enabledPlugins[name] || false }
  getDisabled() { return plugins.filter(p => !this.isEnabled[p.meta.name]) }
  enable(name) {
    const { plugin, meta } = Plugins.get(name)
    if (!plugin) return
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledPlugins", { ...this.enabledPlugins, [meta.name]: true })
    plugin.onStart()
  }
  disable(name) {
    const { plugin, meta } = Plugins.get(name)
    if (!plugin) return
    DataStore.setData("DR_DISCORD_SETTINGS", "enabledPlugins", { ...this.enabledPlugins, [meta.name]: false })
    plugin.onStop()
  }
  toggle(name) { return this.isEnabled(name) ? this.disable(name) : this.enable(name) }
  getByFileName(name) { 
    return plugins.find(p => {
      if (!p.meta.file) return false
      if (p.meta.file.endsWith(name)) return true
      return false
    })
  }
}

const watcher = _fs.watch(_dir, {}, (_,f) => {
  const plug = Plugins.getByFileName(f)
  if(Plugins.isEnabled(plug)){
    Plugins.disable(plug)
    Plugins.enable(plug)
  }
})

module.exports = {
  getByFileName:(name)=>Plugins.getByFileName(name),
  get: (name) => Plugins.get(name),
  getAll: () => Plugins.getAll(),
  getEnabled: () => Plugins.getEnabled(),
  isEnabled: (name) => Plugins.isEnabled(name),
  getDisabled: () => Plugins.getDisabled(),
  enable: (name) => Plugins.enable(name),
  disable: (name) => Plugins.disable(name),
  toggle: (name) => Plugins.toggle(name),
  folder: _dir
}
