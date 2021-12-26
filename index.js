const { join } = require("path")
const electron = { ipcMain } = require("electron")
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
const Module = require("module")
const _sass = require("sass")
const DataStore = require("./core/datastore")

const Settings = DataStore("DR_DISCORD_SETTINGS")

electron.app.commandLine.appendSwitch("no-force-async-hooks-checks")

process.env.DRDISCORD_DIR = __dirname

class BrowserWindow extends electron.BrowserWindow {
  constructor(opt) {
    if (!opt || !opt.webPreferences || !opt.webPreferences.preload || !opt.title) return super(opt)
    const originalPreload = opt.webPreferences.preload
    process.env.DISCORD_PRELOAD = originalPreload

    opt = Object.assign(opt, {
      webPreferences: {
        contextIsolation: false,
        enableRemoteModule: true,
        nodeIntegration: true,
        preload: join(__dirname, "core", "preload.js")
      }
    })
    if (Settings.transparency) {
      opt = Object.assign(opt, {
        transparent: true,
        backgroundColor: "#00000000",
      })
    }

    if (process.argv.includes("--vanilla")) {
      opt.webPreferences.preload = originalPreload
    }

    super(opt)
  }
}

function LoadDiscord() {
  const basePath = join(process.resourcesPath, "app.asar")
  const pkg = require(join(basePath, "package.json"))
  electron.app.setAppPath(basePath)
  electron.app.name = pkg.name
  Module._load(join(basePath, pkg.main), null, true)
}

if (process.argv.includes("--vanilla")) return LoadDiscord()

ipcMain.handle("COMPILE_SASS", (_, sass) => {
  try { return _sass.renderSync({ data: sass }).css.toString() } 
  catch (e) { return e.message }
})
ipcMain.handle("RESTART_DISCORD", () => {
  electron.app.relaunch()
  electron.app.quit()
})
ipcMain.on("POPOUT_WINDOW", (event, { Opts, Url = "https://discord.com/login"}) => {
  const window = new BrowserWindow(Opts)
  window.loadURL(Url)
  event.returnValue = null
})

electron.app.once("ready", () => {
  electron.session.defaultSession.webRequest.onHeadersReceived(function({ responseHeaders }, callback) {
    delete responseHeaders["content-security-policy-report-only"]
    delete responseHeaders["content-security-policy"]
    callback({ 
      cancel: false, 
      responseHeaders
    })
  })
  installExtension(REACT_DEVELOPER_TOOLS)
})

const Electron = new Proxy(electron, { get: (target, prop) => prop === "BrowserWindow" ? BrowserWindow : target[prop] })

const electronPath = require.resolve("electron")
delete require.cache[electronPath].exports
require.cache[electronPath].exports = Electron

LoadDiscord()