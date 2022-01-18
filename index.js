const { join } = require("path")
const electron = { ipcMain } = require("electron")
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer")
const Module = require("module")
const _sass = require("sass")
const DataStore = require("./core/datastore")
const fs = require("fs")

const Settings = DataStore("DR_DISCORD_SETTINGS")

electron.app.commandLine.appendSwitch("no-force-async-hooks-checks")

process.env.DRDISCORD_DIR = __dirname

let hasCrashed = false

class BrowserWindow extends electron.BrowserWindow {
  constructor(opt) {
    if (!opt || !opt.webPreferences || !opt.webPreferences.preload || !opt.title) return super(opt)
    const originalPreload = opt.webPreferences.preload

    if (process.argv.includes("--vanilla")) {
      opt.webPreferences.preload = originalPreload
      return super(opt)
    }

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
    let win = new electron.BrowserWindow(opt)
    win.webContents.on("render-process-gone", () => hasCrashed = true)
    return win
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

ipcMain.on("APP_DID_CRASH", (event) => event.returnValue = hasCrashed)
ipcMain.on("COMPILE_SASS", (event, sass) => {
  let toReturn
  try { toReturn =  _sass.renderSync({ data: sass }).css.toString() } 
  catch (e) { toReturn = e.message }
  event.returnValue = toReturn
})
ipcMain.handle("RESTART_DISCORD", () => {
  electron.app.relaunch()
  electron.app.quit()
})
ipcMain.on("POPOUT_WINDOW", (event, { Opts = {}, Url = "https://discord.com/login"}) => {
  const win = new BrowserWindow(Opts)
  win.loadURL(Url)
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

const Electron = {
  ...electron,
  BrowserWindow
}

const electronPath = require.resolve("electron")
delete require.cache[electronPath].exports
require.cache[electronPath].exports = Electron

// Dont start discord if 'app-old' exists, so we let that mod do it's thing
if (fs.existsSync(join(process.resourcesPath, "app-old"))) require(join(process.resourcesPath, "app-old"))
else LoadDiscord()