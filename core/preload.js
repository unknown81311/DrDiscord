const { webFrame, ipcRenderer } = require("electron")
const { Module } = _module = require("module")

Module.globalPaths.push(require("path").join(process.resourcesPath, "app.asar/node_modules"))

const _path = require("path")
const _fs = require("fs")
const logger = require("./logger")
const { exec } = require("child_process")
const request = require("./request")
const sucrase = require("sucrase")

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
    //
    document.body.classList.add("DrDiscord")
    //
    const stylingApi = require("./stylings")
    const Themes = require("./themes")
    // Monaco
    const requirejsModule = await fetch("https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js").then(e => e.text())
    topWindow.eval(requirejsModule)
    topWindow.requirejs.config({
      paths: {
        "vs": "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.16.2/min/vs"
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
    // Add node require to window
    toWindow(require)
    // Add debugger event
    topWindow.addEventListener("keydown", () => event.code === "F8" && (() => {debugger;})())
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
    const Analytics = find(["getSuperPropertiesBase64"])
    const Reporter = find(["submitLiveCrashReport"])
    const Handlers = find(["analyticsTrackingStoreMaker"])
    const Sentry = {
      main: topWindow.__SENTRY__.hub,
      client: topWindow.__SENTRY__.hub.getClient()
    }
    Analytics.track = () => {}
    Handlers.AnalyticsActionHandlers.handleTrack = () => {}
    Reporter.submitLiveCrashReport = () => {}
    Sentry.client.close()
    Sentry.main.getStackTop().scope.clear()
    Sentry.main.getScope().clear()
    Sentry.main.addBreadcrumb = () => {}
    Object.assign(topWindow.console, ["debug", "info", "warn", "error", "log", "assert"].forEach((method) => {
        if (topWindow.console[method].__sentry_original__) {
          topWindow.console[method] = topWindow.console[method].__sentry_original__
        } else if (topWindow.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__) {
          topWindow.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__ = topWindow.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__.__sentry_original__
        }
      })
    )
    toWindow("console", topWindow.console)
    //
    let interval = setInterval(async () => {
      if (!find(["createElement", "Component"])?.createElement) return
      // clear interval
      clearInterval(interval)
      //
      const DrApi = {
        patch, find, DataStore, Themes,
        request,
        React: {...find(["createElement", "Component"])},
        ReactDOM: {...find(["render", "hydrate"])},
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
          if (goTo) res.then(({guild, channel}) => transitionToGuild(guild.id, channel.id))
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
          openPopout: () => {
            const div = Object.assign(document.createElement("div"), {
              id: "custom-css-popout"
            })
            const header = Object.assign(document.createElement("div"), {
              id: "custom-css-popout-header"
            })
  
            header.append(Object.assign(document.createElement("button"), {
              onclick: () => {
                div.remove()
              },
              innerText: "Close"
            }))
            const content = Object.assign(document.createElement("div"), {
              id: "custom-css-popout-content-wrapper"
            })
            content.append(Object.assign(document.createElement("div"), {
              id: "custom-css-popout-content"
            }))
            div.append(header, content)
            
            header.onmousedown = ({ clientX, clientY }) => {
              const { x, y, width, height } = div.getBoundingClientRect()
              function move(e) {
                let left = (e.clientX - clientX + x)
                if (left > (innerWidth - width - 1)) left = (innerWidth - width - 1)
                else if (left < 1) left = 1
                let top = (e.clientY - clientY + y)
                if (top > (innerHeight - height - 1)) top = (innerHeight - height - 1)
                else if (top < 1) top = 1
  
                div.style.left = `${left}px`
                div.style.top = `${top}px`
              }
              function unMove() {
                window.removeEventListener("mousemove", move)
                window.removeEventListener("mouseup", unMove)
              }
              window.addEventListener("mousemove", move)
              window.addEventListener("mouseup", unMove)
            }
  
            document.getElementById("app-mount").appendChild(div)
  
            const resizer = Object.assign(document.createElement("div"), {
              id: "custom-css-popout-resizer"
            })
            div.append(resizer)
  
            let divRect = div.getBoundingClientRect()
            div.style.left = `${(innerWidth / 2) - (divRect.width / 2)}px`
            div.style.top = `${(innerHeight / 2) - (divRect.height / 2)}px`
            div.style.minWidth = `${divRect.width + 1}px`
            div.style.minHeight = `${divRect.height + 1}px`
            div.style.maxWidth = "700px"
            div.style.maxHeight = "700px"
  
            content.style.setProperty("--header", `${header.getBoundingClientRect().height}px`)
  
            const editor = topWindow.monaco.editor.create(content.childNodes[0], {
              language: "scss",
              theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
              value: global.DrApi.customCSS.get().scss
            })
            editor.onDidChangeModelContent(() => {
              try { global.DrApi.customCSS.update(editor.getValue()) }
              catch (e) { 
                // make error group
                const ere = console.groupCollapsed("Error happened when compiling custom CSS: Click to expand")
                console.error(e)
                console.groupEnd(ere)
              }
            })
            global.FloatingCSSEditor = editor
  
            resizer.onmousedown = () => {
              function resize(ev) {
                let resizerRect = div.getBoundingClientRect()
                let width = ev.pageX - resizerRect.left
                if (width < Number(div.style.minWidth.replace("px", ""))) width = div.style.minWidth
                if (width > 700) width = "700px"
                let height = ev.pageY - resizerRect.top
                if (height < Number(div.style.minHeight.replace("px", ""))) height = div.style.minHeight
                if (height > 700) height = "700px"
                
                div.style.width = `${width}px`
                div.style.height = `${height}px`
                editor.layout()
              }
              function unResize() {
                window.removeEventListener("mousemove", resize)
                window.removeEventListener("mouseup", unResize)
              }
              window.addEventListener("mousemove", resize)
              window.addEventListener("mouseup", unResize)
            }
          }
        },
        util: {
          logger,
          waitFor,
          sleep,
          getOwnerInstance,
          getReactInstance
        },
        isDeveloper: DataStore.getData("DR_DISCORD_SETTINGS", "isDeveloper")
      }
      toWindow("DrApi", DrApi)
      //
      const {
        React, modal: {
          functions: { openModal }
        }
      } = DrApi
      // Add react stuff
      patch.instead("DrDiscordInternal-require-Patch", _module, "_load", function(request, oldLoad) {
        if (request[0] === "react") return DrApi.React
        if (request[0] === "reactDOM") return DrApi.ReactDOM
        return oldLoad.apply(this, request)
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
              ite = ite.replace("* @", "")
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
      request("https://raw.githubusercontent.com/Cumcord/Cumcord/stable/dist/build.js", (err, _, body) => {
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
            FluxDispatcher
          }))
          if (DataStore.getData("DR_DISCORD_SETTINGS", "cc")) toggleCC()
          num++
        }
      })
      Object.defineProperty(find(["isDeveloper"]), "isDeveloper", { 
        get: () => global.DrApi.isDeveloper
      })
      logger.log("DrDiscord", "Loaded!")
      //add cosmetics
      find(["getGuild"]).getGuild("864267123694370836")?.features?.add?.("VERIFIED")
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
      // Current Channel/Guild ATTR
      let currentGuild = find(["getLastSelectedGuildId"]).getGuildId()
      if (currentGuild) document.body.setAttribute("data-guild-id", currentGuild) 
      else document.body.removeAttribute("data-guild-id")

      let currentChannel= find(["getLastSelectedChannelId", "getChannelId"]).getChannelId()
      if (currentChannel) document.body.setAttribute("data-channel-id", currentChannel)
      else document.body.removeAttribute("data-channel-id")

      FluxDispatcher.subscribe("CHANNEL_SELECT", ({ channelId, guildId }) => {
        if (guildId) document.body.setAttribute("data-guild-id", guildId) 
        else document.body.removeAttribute("data-guild-id")

        if (channelId) document.body.setAttribute("data-channel-id", channelId) 
        else document.body.removeAttribute("data-channel-id")
      })
    }, 100)
  })
})(webFrame.top.context)