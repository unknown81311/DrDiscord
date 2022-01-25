const { join } = require("path")
const electron = { ipcMain } = require("electron")
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer")
const Module = require("module")
const _sass = require("sass")
const DataStore = require("./core/datastore")
const fs = require("fs")
const request = require("./core/request")

const Settings = DataStore("DR_DISCORD_SETTINGS")

electron.app.commandLine.appendSwitch("no-force-async-hooks-checks")

let Badges
request("https://raw.githubusercontent.com/Dr-Discord/DrDiscord/main/backend/Badges.json", (_, __, body) => Badges = JSON.parse(body))

function ipc(ev, func) {
  ipcMain.on(ev, async (event, ...args) => {
    event.IS_ON = true
    const res = await func(event, ...args)
    if (!event.returnValue) event.returnValue = res ?? "No response"
  })
  ipcMain.handle(ev, func)
}

let hasCrashed = false

class BrowserWindow extends electron.BrowserWindow {
  constructor(opt) {
    if (!opt || !opt.webPreferences || !opt.webPreferences.preload || !opt.title || process.argv.includes("--vanilla")) return super(opt)
    const originalPreload = opt.webPreferences.preload

    opt.webPreferences = Object.assign(opt.webPreferences, {
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      preload: join(__dirname, "core", "preload.js"),
      devTools: true
    })
    if (Settings.transparency) opt = Object.assign(opt, {
      transparent: true,
      backgroundColor: "#00000000"
    })

    let win = new electron.BrowserWindow(opt)

    win.webContents.on("render-process-gone", () => hasCrashed = true)
    
    ipc("DISCORD_PRELOAD", () => originalPreload)
    ipc("ShowMessageBox", async (ev, opts) => {
      if (ev.IS_ON) return electron.dialog.showMessageBoxSync(opts)
      return await electron.dialog.showMessageBox(opts)
    })
    ipc("APP_DID_CRASH", () => hasCrashed)
    ipc("DR_BADGES", () => Badges)

    if (/\/vizality\/src\/preload\/main.js/.test(originalPreload.replace(/(\/|\\)/, "/"))) {
      electron.dialog.showMessageBoxSync(win, {
        type: "error",
        title: "DrDiscord & Vizality",
        message: "DrDiscord cannot work with Vizality.",
        detail: "DrDiscord will fully load but Vizality will error."
      })
    }

    return win
  }
}

Object.assign(BrowserWindow, electron.BrowserWindow)

function LoadDiscord() {
  const basePath = join(process.resourcesPath, "app.asar")
  const pkg = require(join(basePath, "package.json"))
  electron.app.setAppPath(basePath)
  electron.app.name = pkg.name
  Module._load(join(basePath, pkg.main), null, true)
}

if (process.argv.includes("--vanilla")) return LoadDiscord()

ipc("COMPILE_SASS", (event, sass) => {
  let toReturn
  try { toReturn =  _sass.renderSync({ data: sass }).css.toString() } 
  catch (e) { toReturn = e.message }
  event.returnValue = toReturn
  return toReturn
})
ipc("RESTART_DISCORD", () => {
  electron.app.relaunch()
  electron.app.quit()
})
ipc("POPOUT_WINDOW", (event, { Opts = {}, Url = "https://discord.com/login", injectJs = "(() => {})()" }) => {
  const win = new BrowserWindow(Opts)
  win.loadURL(Url)
  win.webContents.executeJavaScript(injectJs)
})

electron.app.once("ready", () => {
  electron.session.defaultSession.webRequest.onHeadersReceived(function({ responseHeaders }, callback) {
    for (const header in responseHeaders)
      if (header.startsWith("content-security-policy") && Object.hasOwnProperty.call(responseHeaders, header))
        delete responseHeaders[header]
    callback({ 
      cancel: false, 
      responseHeaders
    })
  })
  installExtension(REACT_DEVELOPER_TOOLS)
})

const Electron = {
  ...electron, BrowserWindow
}

const electronPath = require.resolve("electron")
delete require.cache[electronPath].exports
require.cache[electronPath].exports = Electron

// Dont start discord if 'app-old' exists, so we let that mod do it's thing unless its DrDiscord
const appOld = join(process.resourcesPath, "app-old")
if (fs.existsSync(appOld)) {
  if (fs.existsSync(join(appOld, "index.js"))) {
    const js = fs.readFileSync(join(appOld, "index.js"), "utf8")
    if (js === `require("${join(__dirname).replace(/(\/|\\)/g, "/")}")`) LoadDiscord()
    else require(join(process.resourcesPath, "app-old"))
  }
  else require(appOld)
}
else LoadDiscord()