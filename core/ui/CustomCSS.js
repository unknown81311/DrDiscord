const {
  React, DataStore, styling
} = DrApi
const {
  webFrame: {
    top: { context:window }
  }
} = require("electron")

const settings = DataStore("DR_DISCORD_SETTINGS")

module.exports = class CustomCSS extends React.Component {
  constructor() {
    super()
    this.state = {
      error: false
    }
  }
  componentDidError() {
    this.setState({ error: true })
  }
  componentDidMount() {
    if (!window?.monaco?.editor?.create) return this.setState({ error: true })
    this.editor = window.monaco.editor.create(window.document.getElementById("custom-css"), {
      language: "scss",
      theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
      value: settings.CSS,
    })
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue()
      DataStore.setData("DR_DISCORD_SETTINGS", "CSS", value)
      window.document.getElementById("CUSTOMCSS").textContent = styling.compileSass(value)
      if (global.FloatingCSSEditor) FloatingCSSEditor.setValue(value)
    })
    const contextmenu = this.editor.getContribution('editor.contrib.contextmenu')
    contextmenu._onContextMenu = _ => _
  }
  render() {
    return this.state.error ? React.createElement("div", null, "An error accord with the monaco editor"): React.createElement("div", {
      id: "custom-css"
    })
  }
}