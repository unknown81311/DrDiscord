const { webFrame } = require("electron")
const { Module } = _module = require("module")
const _path = require("path")
const _fs = require("fs")
const logger = require("./logger")
const { exec } = require("child_process")

const DataStore = require("./datastore")

logger.log("DrDiscord", "Preloading...")

Module.globalPaths.push(_path.join(process.resourcesPath, "app.asar/node_modules"))

const sleep = (time) => new Promise(resolve =>
  setTimeout(resolve, time)
)
const getReactInstance = (element) => {
  if (element.__reactInternalInstance$) return element.__reactInternalInstance$
  return element[Object.keys(element).find(k => k.startsWith("__reactInternalInstance") || k.startsWith("__reactFiber"))] || null
}
const getOwnerInstance = (element) => {
  const sn = element.__reactFiber$?.return?.stateNode
  if (sn && sn.forceUpdate) return sn
}

// Load discords preload
const path = process.env.DISCORD_PRELOAD
if (path) { require(path) }
else { console.error("No preload path found!") }

((topWindow) => {
  const toWindow = (key, value) => {
    if (key.name === undefined){
      topWindow[key] = value
      global[key] = value
    }
    else {
      topWindow[key.name] = key
      global[key.name] = key
    }
  }
  async function waitFor(querySelector) {
    let elem
    while (!(elem = topWindow.document.querySelector(querySelector))) await sleep(1)
    return elem
  }
  topWindow.document.addEventListener("DOMContentLoaded", async () => {
    // Monaco
    const requirejsModule = await fetch("https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js").then(e => e.text())
    topWindow.eval(requirejsModule)
    topWindow.requirejs.config({paths: {'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/vs'}});
    topWindow.MonacoEnvironment = {
      getWorkerUrl: function (workerId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
          self.MonacoEnvironment = {
            baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/'
          };
          importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/vs/base/worker/workerMain.js');`
        )}`
      }
    }
    topWindow.requirejs(["vs/editor/editor.main"], function () {})
    //
    toWindow(require)
    //
    const patch = require("./patch")
    const find = require("./webpack")
    const stylingApi = require("./stylings")
    //
    let customCSS = DataStore.getData("DR_DISCORD_SETTINGS", "CSS")
    topWindow.document.head.append(Object.assign(document.createElement("style"), {
      textContent: stylingApi.sass(customCSS || ""),
      id: "CUSTOMCSS"
    }))
    //
    const sassStylingFile = _path.join(__dirname, "styles.scss")
    stylingApi.inject("DrDiscordStyles", stylingApi.sass({ file: sassStylingFile }))
    _fs.watchFile(sassStylingFile, {persistent: true, interval: 1000}, () => {
      console.log("[DrDiscord]", "Styles changed, reloading...")
      stylingApi.uninject("DrDiscordStyles")
      stylingApi.inject("DrDiscordStyles", stylingApi.sass({ file: sassStylingFile }))
    })
    //
    let interval = setInterval(() => {
      if (!find(["createElement", "Component"])) return
      //
      clearInterval(interval)
      DiscordNative.window.setDevtoolsCallbacks(null, null)
      //
      const DrApi = {
        patch, find, DataStore,
        React: {...find(["createElement", "Component"])},
        ReactDOM: {...find(["render", "hydrate"])},
        request: require("request"),
        styling: {
          insert: (name, css, sass = false) => stylingApi.inject(name, css, sass),
          remove: (name) => stylingApi.uninject(name),
          compileSass: (options) => stylingApi.sass(options)
        },
        modal: {
          functions: find(["openModal", "openModalLazy"]),
          elements: find(["ModalRoot", "ModalListContent"])
        },
        util: {
          logger,
          waitFor,
          sleep,
          getOwnerInstance,
          getReactInstance,
        },
      }
      toWindow("DrApi", DrApi)
      Object.freeze(DrApi)
      for (const key of Object.keys(DrApi)) Object.freeze(DrApi[key])
      logger.log("DrDiscord", "Loaded!")
      async function start() {
        const {
          React, modal: {
            functions: { openModal },
          }
        } = DrApi
        //
        const { MenuItem } = DrApi.find(["MenuItem"])
        //
        const oldLoad = _module._load
        _module._load = function (request) {
          if (request === "React") return DrApi.React
          if (request === "ReactDOM") return DrApi.ReactDOM
          return oldLoad.apply(this, arguments)
        }
        const ele = getOwnerInstance(await waitFor(".panels-j1Uci_ > .container-3baos1"))
        const { codeBlock } = find(["parse", "parseTopic"]).defaultRules
        //
        const PanelButton = require("./ui/PanelButton")
        //
        patch(ele.__proto__, "render", (_, res) => {
          res.props.children[res.props.children.length - 1].props.children.unshift(
            React.createElement(PanelButton)
          )
        })
        ele.handleMouseEnter()
        // Patch MessageActions
        patch(codeBlock, "react", ([props], origRes) => {
          if (props.type !== "codeBlock" || !props.lang.endsWith("css")) return 
          patch(origRes.props, "render", (_, res) => {
            if (!Array.isArray(res.props.children)) res.props.children = [res.props.children]
            res.props.children.push(React.createElement("button", {
              className: "dr-discord-codeblock-copy-button",
              children: "Add to custom CSS",
              onClick: () => {
                let customCSS = DataStore.getData("DR_DISCORD_SETTINGS", "CSS")
                let css
                if (!customCSS) css = props.content
                else css = `${customCSS}\n${props.content}`
                DataStore.setData("DR_DISCORD_SETTINGS", "CSS", css)
                document.getElementById("CUSTOMCSS").innerText = stylingApi.sass(css || "")
              }
            }))
          })
        })
        //
        const SettingsModal = require("./ui/SettingsModal")
        const openSettings = (page) => openModal(mProps => React.createElement(SettingsModal, { mProps, PAGE: page }))
        //
        patch(find("UserSettingsCogContextMenu"), "default", (_, res) => {
          res.props.children.push(React.createElement(MenuItem, {
            id: "DrApi-settings",
            label: "DrApi Settings",
            action: () => {openSettings(0)}
          }))
        })
        //
        const { transitionToGuild } = find(["transitionToGuild"])
        const { acceptInvite } = find(["acceptInvite"])
        const { getGuilds } = find(["getGuilds"])
        // Load CC
        DrApi.request("https://raw.githubusercontent.com/Cumcord/Cumcord/stable/dist/build.js", (err, _, body) => {
          if (err) logger.error(err)
          else {
            let num = 0
            function toggleCC() {
              if (topWindow.cumcord) {
                topWindow.cumcord.uninject()
                return logger.log("DrDiscord", "Disabled CC")
              }
              else {
                topWindow.eval(body)
                return Boolean(num) ? logger.log("DrDiscord", "Enabled CC") : null
              }
            }
            toWindow("DrApi", Object.assign({}, DrApi, {
              toggleCC,
              openSettings,
              joinServer: () => {
                if (Boolean(getGuilds()["864267123694370836"])) transitionToGuild("864267123694370836", "864659344523001856")
                else acceptInvite("XkQMaw34").then(({guild, channel}) => transitionToGuild(guild.id, channel.id))
              },
              updateDrDiscord: () => {
                exec(`cd ${process.env.DRDISCORD_DIR} && git stache && git pull`, function(err, res) {
                  if (err) return console.error(err)
                  else ipcRenderer.invoke("RESTART_DISCORD")
                })
              }
            }))
            if (DataStore.getData("DR_DISCORD_SETTINGS", "cc")) toggleCC()
            num++
          }
        })
      }
      start()
    }, 100)
  })
})(webFrame.top.context)