const _sass = require("sass")

class stylingApi {
  constructor() {
    this.styles = {}
    if (document.querySelector("DrDiscord")) this.DrDiscordHead = document.querySelector("DrDiscord")
    else document.head.appendChild(this.DrDiscordHead = document.createElement("DrDiscord"))
  }
  /**
   * @name inject
   * @description Injects a style into the document.
   * @param {String} name 
   * @param {String} css 
   * @returns undefined
   */
  inject(name, css, sass = false) {
    if (this.styles[name]) this.uninject(name)
    if (sass) css = this.sass({ data: css })
    const style = Object.assign(document.createElement("style"), {
      type: "text/css",
      innerText: css,
      id: name
    })
    this.DrDiscordHead.appendChild(style)
    this.styles[name] = {
      styling: css,
      element: style,
      id: name
    }
    
    return () => this.uninject(name)
  }
  /**
   * @name uninject
   * @description Uninjects a style from the document.
   * @param {String} name
   */
  uninject(name) {
    if (!this.styles[name]) return
    this.styles[name].element.remove()
    delete this.styles[name]
  }
  update(name, css, sass = false) {
    if (!this.styles[name]) return
    this.styles[name].element.innerText = css
    if (sass) this.styles[name].element.innerText = this.sass({ data: css })
  }
  /**
   * @name sass
   * @description compiles sass to css.
   * @param {Option|String} options 
   * @returns compiled sass
   */
  sass(options) {
    if (typeof options === "string") options = { data: options }
    return _sass.renderSync(options).css.toString()
  }
}

module.exports = new stylingApi