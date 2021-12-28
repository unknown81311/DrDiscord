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
    const regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i

    if (!Array.isArray(css)) css = [css]

    for (const num of Object.keys(css))
    if (regex.test(css[num])) css[num] = `@import url(${css[num]});`
    css = css.join("\n")

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