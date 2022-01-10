const {
  React, DataStore
} = DrApi
const {
  webFrame: {
    top: { context:window }
  }
} = require("electron")
const mod = require("module")

const Icons = require("./Icons")
const Tooltip = DrApi.find.prototypes("renderTooltip").default
const TextInput = DrApi.find("TextInput").default

const sucrase = require("sucrase")

const settings = DataStore("DR_DISCORD_SETTINGS")

const Button = DrApi.find(["ButtonColors"])
const Flex = {
  Child: FlexChild
} = DrApi.find("Flex").default
const SwitchItem = DrApi.find("SwitchItem").default

function runCode(compiled) {
  mod.prototype._compile(`try {\n${compiled}\n}\ncatch(e) {\nconsole.error(e)\n}`, "Custom JS")
}

module.exports = class CustomJS extends React.Component {
  constructor() {
    super()
    this.state = {
      error: false,
      ts: settings.CJS_TS
    }
    this.ref = React.createRef()
  }
  componentDidError() {
    this.setState({ error: true })
  }
  componentDidMount() {
    if (!window?.monaco?.editor?.create) return this.setState({ error: true })
    this.editor = window.monaco.editor.create(this.ref.current, {
      language: settings.CJS_TS ? "typescript" : "javascript",
      theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
      value: settings.CJS,
    })
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue()
      DataStore.setData("DR_DISCORD_SETTINGS", "CJS", value)
    })
    const contextmenu = this.editor.getContribution('editor.contrib.contextmenu')
    contextmenu._onContextMenu = _ => _
    window.TEST = this.editor
  }
  render() {
    return this.state.error ? React.createElement("div", null, "An error accord with the monaco editor") : React.createElement("div", {
      id: "cjs",
      children: [
        React.createElement(Flex, {
          className: "Dr-CustomJS-Top",
          children: [
            React.createElement(FlexChild, {
              grow: 0,
              children: React.createElement(Button.default, {
                children: React.createElement(Tooltip, {
                  text: `Run ${this.state.ts ? "TypeScript" : "JavaScript"}`,
                  children: (ttProps) => React.createElement(Icons.CustomJS, {
                    width: 20,
                    height: 20,
                    ...ttProps
                  })
                }),
                size: Button.ButtonSizes.ICON,
                onClick: () => {
                  let value = this.editor.getValue()
                  let compiled = sucrase.transform(value, {
                    transforms: ["jsx", "imports", "typescript"],
                    production: true
                  }).code                  
                  if (value.includes("Token")) {
                    let val = ""
                    DrApi.showConfirmationModal("Custom JS", [
                      "Enter `TrUSt`, this is cAsE SeNsItIvE? This is only shown since your code contains `Token`",
                      React.createElement("div"),
                      React.createElement((() => React.memo(() => {
                        const [name, setName] = React.useState(val)
                        return React.createElement(TextInput, {
                          value: name,
                          onInput: e => {
                            setName(e.target.value)
                            val = e.target.value
                          },
                          placeholder: "Enter `TrUSt`"
                        })
                      }))())
                    ], {
                      confirmText: "Install",
                      onConfirm: () => val === "TrUSt" && runCode(compiled)
                    })
                  } 
                  else { runCode(compiled) }
                }
              })
            }),
            React.createElement(FlexChild, {
              grow: 0,
              children: React.createElement(SwitchItem, {
                children: "Use TypeScript",
                value: this.state.ts,
                onChange: val => {
                  window.monaco.editor.setModelLanguage(this.editor.getModel(), val ? "typescript" : "javascript")
                  DataStore.setData("DR_DISCORD_SETTINGS", "CJS_TS", val)
                  this.setState({ ts: val })
                }
              })
            })
          ]
        }),
        React.createElement("div", {
          id: "monaco-editor",
          ref: this.ref
        })
      ]
    })
  }
}