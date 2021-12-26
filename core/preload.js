const { webFrame, ipcRenderer } = require("electron")
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
    //
    document.body.classList.add("DrDiscord")
    //
    const stylingApi = require("./stylings")
    const Themes = require("./themes")
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
      console.log("[DrDiscord]", "Styles changed, reloading...")
      stylingApi.uninject("DrDiscordStyles")
      stylingApi.inject("DrDiscordStyles", stylingApi.sass({ file: sassStylingFile }))
    })
    //
    let interval = setInterval(async () => {
      if (!find(["createElement", "Component"])?.createElement) return
      // clear interval
      clearInterval(interval)
      //
      const DrApi = {
        patch, find, DataStore, Themes,
        React: {...find(["createElement", "Component"])},
        ReactDOM: {...find(["render", "hydrate"])},
        ReactSpring: {...find(["useSpring", "useTransition"])},
        request: require("request"),
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
          const Markdown = DrApi.find(m => m.default?.displayName === "Markdown" && m.default.rules).default
          const ConfirmationModal = DrApi.find("ConfirmModal").default
          const Button = DrApi.find(["ButtonColors"])
          const { Messages } = DrApi.find(m => m.default?.Messages?.OKAY).default

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
      await waitFor(".guilds-1SWlCJ")
      // Add plugin language
      DrApi.find(["registerLanguage"]).registerLanguage("plugin", DrApi.find(m => m.name === "" && m.toString().startsWith("function(e){const o=t")))
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
              className: "dr-discord-codeblock-add-plugin",
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
              className: "dr-discord-codeblock-copy-button",
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
      const ele = getOwnerInstance(await waitFor(".panels-j1Uci_ > .container-3baos1"))
      //
      let Plugins = require("./plugins")
      DrApi.Plugins = Plugins
      //
      const PanelButton = require("./ui/PanelButton")
      //
      patch("DrDiscordInternal-Panel-Patch", ele.__proto__, "render", (_, res) => {
        res.props.children[res.props.children.length - 1].props.children.unshift(
          React.createElement(PanelButton)
        )
      })
      ele.forceUpdate()
      //
      const SettingsModal = require("./ui/SettingsModal")
      const openSettings = (page, reactElement) => openModal(mProps => React.createElement(SettingsModal, { mProps, PAGE: page, reactElement }))
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
            openSettings
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
      DrApi.find(["getGuild"]).getGuild("864267123694370836")?.features?.add?.("VERIFIED")
      // Badges
      const Badges = {
        "515780151791976453": {
          name: "DrDiscord Developer",
          icon: {
            tag: "svg",
            width: "22",
            height: "22",
            viewBox: "0 0 22 22",
            children: [
              {
                tag: "path",
                color: "currentColor",
                d: "M11.1903 7.802C11.1903 8.426 11.1003 9.092 10.9203 9.8C10.7403 10.496 10.4883 11.192 10.1643 11.888C9.84032 12.572 9.43832 13.232 8.95832 13.868C8.49032 14.492 7.95632 15.044 7.35632 15.524C6.75632 15.992 6.09632 16.37 5.37632 16.658C4.66832 16.946 3.91232 17.09 3.10832 17.09C2.94032 17.09 2.77232 17.078 2.60432 17.054C2.43632 17.042 2.26832 17.024 2.10032 17C2.42432 15.344 2.74232 13.73 3.05432 12.158C3.17432 11.498 3.30032 10.814 3.43232 10.106C3.56432 9.386 3.69032 8.678 3.81032 7.982C3.93032 7.286 4.04432 6.62 4.15232 5.984C4.27232 5.348 4.36832 4.772 4.44032 4.256C4.95632 4.16 5.47832 4.07 6.00632 3.986C6.53432 3.902 7.07432 3.86 7.62632 3.86C8.27432 3.86 8.82032 3.962 9.26432 4.166C9.72032 4.37 10.0863 4.652 10.3623 5.012C10.6503 5.372 10.8603 5.792 10.9923 6.272C11.1243 6.752 11.1903 7.262 11.1903 7.802ZM6.94232 6.398C6.81032 7.106 6.67232 7.784 6.52832 8.432C6.38432 9.08 6.24032 9.734 6.09632 10.394C5.95232 11.054 5.80832 11.744 5.66432 12.464C5.52032 13.184 5.38232 13.97 5.25032 14.822C5.53832 14.63 5.81432 14.372 6.07832 14.048C6.35432 13.712 6.61232 13.328 6.85232 12.896C7.09232 12.464 7.30832 12.008 7.50032 11.528C7.70432 11.048 7.87832 10.58 8.02232 10.124C8.16632 9.668 8.27432 9.242 8.34632 8.846C8.43032 8.45 8.47232 8.108 8.47232 7.82C8.47232 7.376 8.34632 7.028 8.09432 6.776C7.85432 6.524 7.47032 6.398 6.94232 6.398ZM10.0456 17.018C10.3696 15.422 10.6816 13.862 10.9816 12.338C11.0896 11.69 11.2096 11.018 11.3416 10.322C11.4736 9.614 11.5936 8.918 11.7016 8.234C11.8216 7.538 11.9296 6.872 12.0256 6.236C12.1336 5.588 12.2176 5 12.2776 4.472C12.9616 4.256 13.6996 4.1 14.4916 4.004C15.2836 3.896 16.0696 3.842 16.8496 3.842C17.3176 3.842 17.7016 3.896 18.0016 4.004C18.3136 4.112 18.5536 4.268 18.7216 4.472C18.9016 4.664 19.0276 4.892 19.0996 5.156C19.1716 5.42 19.2076 5.714 19.2076 6.038C19.2076 6.518 19.1236 6.992 18.9556 7.46C18.7876 7.916 18.5596 8.354 18.2716 8.774C17.9956 9.182 17.6716 9.56 17.2996 9.908C16.9396 10.244 16.5496 10.52 16.1296 10.736C16.3456 11.216 16.5736 11.744 16.8136 12.32C17.0656 12.884 17.2996 13.424 17.5156 13.94C17.7556 14.54 18.0016 15.14 18.2536 15.74L15.4636 16.712C15.2236 15.944 15.0076 15.224 14.8156 14.552C14.7316 14.276 14.6476 13.994 14.5636 13.706C14.4796 13.406 14.4016 13.124 14.3296 12.86C14.2576 12.596 14.1976 12.362 14.1496 12.158C14.1016 11.942 14.0716 11.768 14.0596 11.636L13.8256 11.708C13.7536 12.092 13.6636 12.542 13.5556 13.058C13.4596 13.574 13.3696 14.072 13.2856 14.552C13.1776 15.116 13.0696 15.686 12.9616 16.262L10.0456 17.018ZM14.2756 9.206C14.5036 9.182 14.7796 9.086 15.1036 8.918C15.4396 8.75 15.7576 8.552 16.0576 8.324C16.3576 8.084 16.6156 7.838 16.8316 7.586C17.0476 7.334 17.1556 7.112 17.1556 6.92C17.1556 6.788 17.1136 6.686 17.0296 6.614C16.9456 6.53 16.8256 6.47 16.6696 6.434C16.5256 6.386 16.3636 6.356 16.1836 6.344C16.0036 6.332 15.8176 6.326 15.6256 6.326C15.4936 6.326 15.3556 6.332 15.2116 6.344C15.0796 6.344 14.9596 6.344 14.8516 6.344L14.2756 9.206Z"
              }
            ]
          },
        },
        "359174224809689089": {
          name: "DrDiscord Developer",
          icon: {
            tag: "svg",
            width: "22",
            height: "22",
            viewBox: "0 0 22 22",
            children: [
              {
                tag: "path",
                color: "currentColor",
                d: "M11.1903 7.802C11.1903 8.426 11.1003 9.092 10.9203 9.8C10.7403 10.496 10.4883 11.192 10.1643 11.888C9.84032 12.572 9.43832 13.232 8.95832 13.868C8.49032 14.492 7.95632 15.044 7.35632 15.524C6.75632 15.992 6.09632 16.37 5.37632 16.658C4.66832 16.946 3.91232 17.09 3.10832 17.09C2.94032 17.09 2.77232 17.078 2.60432 17.054C2.43632 17.042 2.26832 17.024 2.10032 17C2.42432 15.344 2.74232 13.73 3.05432 12.158C3.17432 11.498 3.30032 10.814 3.43232 10.106C3.56432 9.386 3.69032 8.678 3.81032 7.982C3.93032 7.286 4.04432 6.62 4.15232 5.984C4.27232 5.348 4.36832 4.772 4.44032 4.256C4.95632 4.16 5.47832 4.07 6.00632 3.986C6.53432 3.902 7.07432 3.86 7.62632 3.86C8.27432 3.86 8.82032 3.962 9.26432 4.166C9.72032 4.37 10.0863 4.652 10.3623 5.012C10.6503 5.372 10.8603 5.792 10.9923 6.272C11.1243 6.752 11.1903 7.262 11.1903 7.802ZM6.94232 6.398C6.81032 7.106 6.67232 7.784 6.52832 8.432C6.38432 9.08 6.24032 9.734 6.09632 10.394C5.95232 11.054 5.80832 11.744 5.66432 12.464C5.52032 13.184 5.38232 13.97 5.25032 14.822C5.53832 14.63 5.81432 14.372 6.07832 14.048C6.35432 13.712 6.61232 13.328 6.85232 12.896C7.09232 12.464 7.30832 12.008 7.50032 11.528C7.70432 11.048 7.87832 10.58 8.02232 10.124C8.16632 9.668 8.27432 9.242 8.34632 8.846C8.43032 8.45 8.47232 8.108 8.47232 7.82C8.47232 7.376 8.34632 7.028 8.09432 6.776C7.85432 6.524 7.47032 6.398 6.94232 6.398ZM10.0456 17.018C10.3696 15.422 10.6816 13.862 10.9816 12.338C11.0896 11.69 11.2096 11.018 11.3416 10.322C11.4736 9.614 11.5936 8.918 11.7016 8.234C11.8216 7.538 11.9296 6.872 12.0256 6.236C12.1336 5.588 12.2176 5 12.2776 4.472C12.9616 4.256 13.6996 4.1 14.4916 4.004C15.2836 3.896 16.0696 3.842 16.8496 3.842C17.3176 3.842 17.7016 3.896 18.0016 4.004C18.3136 4.112 18.5536 4.268 18.7216 4.472C18.9016 4.664 19.0276 4.892 19.0996 5.156C19.1716 5.42 19.2076 5.714 19.2076 6.038C19.2076 6.518 19.1236 6.992 18.9556 7.46C18.7876 7.916 18.5596 8.354 18.2716 8.774C17.9956 9.182 17.6716 9.56 17.2996 9.908C16.9396 10.244 16.5496 10.52 16.1296 10.736C16.3456 11.216 16.5736 11.744 16.8136 12.32C17.0656 12.884 17.2996 13.424 17.5156 13.94C17.7556 14.54 18.0016 15.14 18.2536 15.74L15.4636 16.712C15.2236 15.944 15.0076 15.224 14.8156 14.552C14.7316 14.276 14.6476 13.994 14.5636 13.706C14.4796 13.406 14.4016 13.124 14.3296 12.86C14.2576 12.596 14.1976 12.362 14.1496 12.158C14.1016 11.942 14.0716 11.768 14.0596 11.636L13.8256 11.708C13.7536 12.092 13.6636 12.542 13.5556 13.058C13.4596 13.574 13.3696 14.072 13.2856 14.552C13.1776 15.116 13.0696 15.686 12.9616 16.262L10.0456 17.018ZM14.2756 9.206C14.5036 9.182 14.7796 9.086 15.1036 8.918C15.4396 8.75 15.7576 8.552 16.0576 8.324C16.3576 8.084 16.6156 7.838 16.8316 7.586C17.0476 7.334 17.1556 7.112 17.1556 6.92C17.1556 6.788 17.1136 6.686 17.0296 6.614C16.9456 6.53 16.8256 6.47 16.6696 6.434C16.5256 6.386 16.3636 6.356 16.1836 6.344C16.0036 6.332 15.8176 6.326 15.6256 6.326C15.4936 6.326 15.3556 6.332 15.2116 6.344C15.0796 6.344 14.9596 6.344 14.8516 6.344L14.2756 9.206Z"
              }
            ]
          },
        }
      }
      patch("DrDiscordInternal-Badge-Patch", DrApi.find("UserProfileBadgeList"), "default", ([{user}], res) => {
        const Badge = Badges[user.id]
        if (!Badge) return
        res.props.children.push(React.createElement(DrApi.find("Tooltip").default, {
          text: Badges[user.id].name, 
          children: (props) => React.createElement(DrApi.find("Clickable").default, {
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
    }, 100)
  })
})(webFrame.top.context)