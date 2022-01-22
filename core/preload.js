const { webFrame, ipcRenderer } = require("electron")
const logger = require("./logger")

const DISCORD_PRELOAD = ipcRenderer.sendSync("DISCORD_PRELOAD")

// crash hangler
if (ipcRenderer.sendSync("APP_DID_CRASH")) return (() => {
  logger.error("DrDiscord:ELECTRON", "Discord has crashed before so DrDiscord will not load until Discord is restarted.")
  // Load discords preload
  if (DISCORD_PRELOAD) { require(DISCORD_PRELOAD) }
  else { logger.error("DrDiscord:ELECTRON", "No Discord preload was found.") }
})()

const { Module } = _module = require("module")

Module.globalPaths.push(require("path").join(process.resourcesPath, "app.asar/node_modules"))

const _path = require("path")
const _fs = require("fs")
const { exec } = require("child_process")
const request = require("./request")
const sucrase = require("sucrase")
const NodeEvents = require("events")

function Compiler(module, filename) {
  const jsx = _fs.readFileSync(filename, "utf8");
  const compiled = sucrase.transform(jsx, {
    transforms: ["jsx", "imports", "typescript"],
    filePath: filename,
    production: true
  }).code
  module._compile(compiled, filename)
}

for (const jsType of [".jsx", ".ts", ".tsx"]) {
  require.extensions[jsType] = Compiler
  Object.freeze(require.extensions[jsType])
}

const DataStore = require("./datastore")

logger.log("DrDiscord", "Preloading...")

let Badges

request("https://raw.githubusercontent.com/Dr-Discord/DrDiscord/main/backend/Badges.json", (_, __, body) => Badges = JSON.parse(body))

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
if (DISCORD_PRELOAD) { require(DISCORD_PRELOAD) }
else { logger.error("DrDiscord:ELECTRON", "No Discord preload was found.") }

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
  // Add window to global and global to window
  topWindow.global = global
  global.window = topWindow
  // require
  toWindow(require)
  // webpackChunkdiscord_app to global
  global.webpackChunkdiscord_app = topWindow.webpackChunkdiscord_app
  // Add process to window for bd
  const cloneObject = function (target, newObject = {}, keys) {
    if (!Array.isArray(keys)) keys = Object.keys(Object.getOwnPropertyDescriptors(target))
    return keys.reduce((clone, key) => {
      if (typeof(target[key]) === "object" && !Array.isArray(target[key]) && target[key] !== null && !(target[key] instanceof NodeEvents)) clone[key] = cloneObject(target[key], {})
      else clone[key] = target[key];
      return clone
    }, newObject)
  }
  toWindow("process", new class PatchedProcess extends NodeEvents {
    get __ORIGINAL_PROCESS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED__() { return process }
  
    constructor() {
      super()
      Object.assign(this,
        cloneObject(process, {}, Object.keys(NodeEvents.prototype)),
        cloneObject(process, {})
      )
    }
  })
  // toWindow("process", process)
  async function waitFor(querySelector) {
    let elem
    while (!(elem = topWindow.document.querySelector(querySelector))) await sleep(1)
    return elem
  }
  async function waitUntil(condition) {
    let item
    while (!(item = condition())) await sleep(1)
    return item
  }
  topWindow.document.addEventListener("DOMContentLoaded", async () => {
    //
    const { openPopout } = require("./ui/CustomCSS")
    //
    document.body.classList.add("DrDiscord")
    //
    const stylingApi = require("./stylings")
    const Themes = require("./themes")
    // Add debugger event
    topWindow.addEventListener("keydown", () => event.code === "F8" && (() => {
      debugger
    })())
    // Remove discords warnings
    DiscordNative.window.setDevtoolsCallbacks(null, null)
    //
    const patch = require("./patch")
    const find = require("./webpack")
    // Add custom css
    let customCSS = DataStore.getData("DR_DISCORD_SETTINGS", "CSS")
    topWindow.document.head.append(Object.assign(document.createElement("style"), {
      textContent: stylingApi.sass(customCSS || ""),
      id: "CUSTOMCSS"
    }))
    // Add minimal mode
    let minimalMode = DataStore.getData("DR_DISCORD_SETTINGS", "minimalMode")
    if (minimalMode) document.body.classList.toggle("minimal-mode")
    //
    const sassStylingFile = _path.join(__dirname, "styles.scss")
    stylingApi.inject("DrDiscordStyles", stylingApi.sass({ file: sassStylingFile }))
    _fs.watchFile(sassStylingFile, {persistent: true, interval: 1000}, () => {
      logger.log("DrDiscord", "Styles changed, reloading...")
      stylingApi.uninject("DrDiscordStyles")
      stylingApi.inject("DrDiscordStyles", stylingApi.sass({ file: sassStylingFile }))
    })
    //
    START()
    async function START() {
      const React = await waitUntil(() => {
        if (!find(["createElement", "Component"])?.createElement) return false
        return find(["createElement", "Component"])
      })
      const ReactDOM = await waitUntil(() => {
        if (!find(["render", "hydrate"])?.render) return false
        return find(["render", "hydrate"])
      })
      // using eval because it looks cleaner
      let depFind = eval(`(function(...args) {\n  logger.warn("DrApi.find", "'find' is deprecated, use 'getModule' instead")\n  return DrApi.getModule(...args)\n})`)
      Object.keys(find).forEach(e => depFind[e] = eval(`(function(...args) {\n  logger.warn("DrApi.find.${e}", "'find' is deprecated, use 'getModule' instead")\n  return DrApi.getModule.${e}(...args)\n})`))
      //
      const DrApi = {
        patch, find: depFind, DataStore, Themes, getModule: find,
        request,
        React: {...React},
        ReactDOM: {...ReactDOM},
        styling: {
          insert: (name, css, sass = false) => stylingApi.inject(name, css, sass),
          remove: (name) => stylingApi.uninject(name),
          update: (name, css, sass = false) => stylingApi.update(name, css, sass),
          compileSass: (options) => stylingApi.sass(options)
        },
        modal: {
          functions: find(["openModal", "openModalLazy"]),
          elements: find(["ModalRoot", "ModalListContent"])
        },
        joinServer: (code, goTo = true) => {
          const { transitionToGuild } = find(["transitionToGuild"])
          const { acceptInvite } = find(["acceptInvite"])

          const res = acceptInvite(code)
          if (goTo) res.then(({ guild, channel }) => transitionToGuild(guild.id, channel.id))
        },
        joinOfficialServer: () => {
          const { transitionToGuild } = find(["transitionToGuild"])
          const { getGuilds } = find(["getGuilds"])

          if (Boolean(getGuilds()["864267123694370836"])) transitionToGuild("864267123694370836", "864659344523001856")
          else global.DrApi.joinServer("XkQMaw34")
        },
        updateDrDiscord: () => {
          exec(`cd ${process.env.DRDISCORD_DIR} && npm run update`, function(err, res) {
            if (err) console.error(err)
            else ipcRenderer.invoke("RESTART_DISCORD")
          })
        },
        showConfirmationModal(title, content, options = {}) {
          const Markdown = find(m => m.default?.displayName === "Markdown" && m.default.rules).default
          const ConfirmationModal = find("ConfirmModal").default
          const Button = find(["ButtonColors"])
          const { Messages } = find(m => m.default?.Messages?.OKAY).default

          const emptyFunction = () => {}
          const {onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = Messages.OKAY, cancelText = Messages.CANCEL, danger = false, key = undefined} = options
          if (!Array.isArray(content)) content = [content]
          content = content.map(c => typeof(c) === "string" ? React.createElement(Markdown, null, c) : c)
          return openModal(props => {
            return React.createElement(ConfirmationModal, Object.assign({
              header: title,
              confirmButtonColor: danger ? Button.ButtonColors.RED : Button.ButtonColors.BRAND,
              confirmText: confirmText,
              cancelText: cancelText,
              onConfirm: onConfirm,
              onCancel: onCancel
            }, props), content)
          }, {modalKey: key})
        },
        customCSS: {
          update: (scss) => {
            DataStore.setData("DR_DISCORD_SETTINGS", "CSS", scss)
            document.getElementById("CUSTOMCSS").innerText = stylingApi.sass(scss || "")
          },
          get: () => {
            let customCSS = DataStore.getData("DR_DISCORD_SETTINGS", "CSS")
            return { css: stylingApi.sass(customCSS || ""), scss: customCSS || "" }
          },
          openPopout
        },
        util: {
          logger,
          waitFor,
          waitUntil,
          sleep,
          getOwnerInstance,
          getReactInstance,
          cloneObject
        },
        isDeveloper: DataStore.getData("DR_DISCORD_SETTINGS", "isDeveloper")
      }
      toWindow("DrApi", DrApi)
      //
      const {
        modal: {
          functions: { openModal }
        }
      } = DrApi
      // Add react stuff
      patch.instead("DrDiscordInternal-require-Patch", _module, "_load", function(args, oldLoad) {
        // Add React and ReactDOM to require
        function ret(item) { return () => item }
        if (args[0] === "react") return () => React
        if (args[0] === "react-dom") return () => ReactDOM
        // Replace OpenAsars request with our own (So it can support http and not log)
        if (args[0] === "request" && topWindow.openasar) return () => request
        // fancy stuff, ex 'require("DrApi/patch/patches")'
        if (args[0].startsWith("DrApi")) return (() => {
          let toReturn = DrApi
          let splitRes = args[0].split("/")
          for (let i = 1; i < splitRes.length; i++) toReturn = toReturn[splitRes[i]]
          return toReturn ? () => toReturn : oldLoad
        })()
        return oldLoad
      })
      // 
      await waitFor(".guilds-2JjMmN")
      // Add plugin language
      find(["registerLanguage"]).registerLanguage("plugin", find(m => m.name === "" && m.toString().startsWith("function(e){const o=t")))
      //
      const { codeBlock } = find(["parse", "parseTopic"]).defaultRules
      patch("DrDiscordInternal-CodeBlock-Patch", codeBlock, "react", ([props], origRes) => {
        if (props.type !== "codeBlock") return 
        if (props.content.startsWith("/**") && props.lang === "plugin") {
          patch.quick(origRes.props, "render", (_, res) => {
            if (!Array.isArray(res.props.children)) res.props.children = [res.props.children]
            let meta = {}
            let jsdoc = props.content.match(/\/\*\*([\s\S]*?)\*\//)[1]
            for (let ite of jsdoc.match(/\*\s([^\n]*)/g)) {
              if (ite.startsWith("* @")) ite = ite.replace("* @", "")
              else ite = ite.replace("*@", "")
              let split = ite.split(" ")
              let key = split[0]
              let value = split.slice(1).join(" ")
              meta[key] = value
            }
            res.props.children.push(React.createElement("button", {
              className: "Dr-codeblock-add-plugin",
              children: `Install ${meta.name}`,
              onClick: () => {
                DrApi.showConfirmationModal("Install Plugin", [
                  `Are you sure you want to install ${meta.name}?`,
                  props.content.includes("BdApi") ? "This could be a BetterDiscord plugin since it contians `BdApi" : null,
                ], {
                  confirmText: "Install",
                  onConfirm: () => {
                    _fs.writeFileSync(_path.join(DrApi.Plugins.folder, `${meta.name}.js`), props.content, "utf8")
                  }
                })
              }
            }))
          })
        }
        if (props.lang.endsWith("css")) {
          patch.quick(origRes.props, "render", (_, res) => {
            if (!Array.isArray(res.props.children)) res.props.children = [res.props.children]
            res.props.children.push(React.createElement("button", {
              className: "Dr-codeblock-copy-button",
              children: "Add to custom CSS",
              onClick: () => {
                let customCSS = DataStore.getData("DR_DISCORD_SETTINGS", "CSS")
                let css
                if (!customCSS) css = props.content
                else css = `${customCSS}\n${props.content}`
                DataStore.setData("DR_DISCORD_SETTINGS", "CSS", css)
                if (global.FloatingCSSEditor) FloatingCSSEditor.setValue(css)
                document.getElementById("CUSTOMCSS").innerText = stylingApi.sass(css || "")
              }
            }))
          })
        }
      })
      const ele = getOwnerInstance(await waitFor(".panels-3wFtMD > .container-YkUktl"))
      //
      let Plugins = require("./plugins")
      DrApi.Plugins = Plugins
      //
      const PanelButton = require("./ui/PanelButton")
      patch("DrDiscordInternal-Panel-Patch", ele.__proto__, "render", (_, res) => {
        res.props.children[res.props.children.length - 1].props.children.unshift(
          React.createElement(PanelButton)
        )
      })
      ele.forceUpdate()
      //
      const FluxDispatcher = find(["_currentDispatchActionType", "_processingWaitQueue"])
      //
      const SettingsModal = require("./ui/SettingsModal")
      const openSettings = (page, reactElement) => openModal(mProps => React.createElement(SettingsModal, { mProps, PAGE: page, reactElement }))
      // Load CC
      request("https://raw.githubusercontent.com/Cumcord/builds/main/build.js", (err, _, body) => {
        if (err) logger.error("DrDiscord:Cumcord", err)
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
          toWindow("DrApi", Object.assign({}, DrApi, { toggleCC }))
          if (DataStore.getData("DR_DISCORD_SETTINGS", "cc")) toggleCC()
          num++
        }
      })
      toWindow("DrApi", Object.assign({}, DrApi, {
        openSettings,
        FluxDispatcher
      }))
      Object.defineProperty(find(["isDeveloper"]), "isDeveloper", { 
        get: () => global.DrApi.isDeveloper,
        set: (val) => {
          global.DrApi.isDeveloper = val
          DataStore.setData("DR_DISCORD_SETTINGS", "isDeveloper", val)
        }
      })
      logger.log("DrDiscord", "Loaded!")
      // Add custom css settings
      let 
        data = DataStore("DR_DISCORD_SETTINGS").csss,
        style = '';
      for (a in data) {
        style+=`--dr-${a}:${data[a]};`
      }
      DrApi.styling.insert('csss',`:root{${style}}`)
      //add cosmetics
      patch("test", find("GuildTooltip"), "default", ([props], res) => {
        if (!(props.guild.id === "864267123694370836" && !props.guild.features.has("VERIFIED"))) return
        props.guild.features.add("VERIFIED")
      })
      // Badges
      patch("DrDiscordInternal-Badge-Patch", find("UserProfileBadgeList"), "default", ([{user}], res) => {
        const Badge = Badges[user.id]
        if (!Badge) return
        res.props.children.push(React.createElement(find("Tooltip").default, {
          text: Badges[user.id].name, 
          children: (props) => React.createElement(find("Clickable").default, {
            ...props,
            className: "Dr-Badge",
            children: React.createElement(Badge.icon.tag, {
              width: Badge.icon.width,
              height: Badge.icon.height,
              viewBox: Badge.icon.viewBox,
              color: Badge.icon.color,
              children: Badge.icon.children.map(child => React.createElement(child.tag, {
                d: child.d,
                fill: child.color,
              }))
            })
          })
        }))
      })
      // monaco
      await fetch("https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js").then(e => e.text()).then(eval).then(() => {
        if (!Object.keys(topWindow).includes("requirejs")) return
        topWindow.requirejs.config({
          paths: {
            vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/vs"
          }
        })
        topWindow.MonacoEnvironment = {
          getWorkerUrl: function (workerId, label) {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/"
              };
              importScripts("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/vs/base/worker/workerMain.js");`
            )}`
          }
        }
        topWindow.requirejs(["vs/editor/editor.main"], function () {})
      })
    }
  })
})(webFrame.top.context)
