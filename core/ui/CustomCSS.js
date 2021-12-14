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
  }
  componentDidMount() {
    this.editor = window.monaco.editor.create(window.document.getElementById("custom-css"), {
      language: "scss",
      theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
      value: settings.CSS,
    })
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue()
      settings.CSS = value
      window.document.getElementById("CUSTOMCSS").textContent = styling.compileSass(value)
    })
  }
  render() {
    return React.createElement("div", {
      id: "custom-css",
    })
  }
}