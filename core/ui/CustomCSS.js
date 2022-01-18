/**
 * Work in process for the custom css editor with settings 
 */

function openSettings(css){
  try{
  const settings = css.match(/:root( +|){((.|\n)*)}/)[0].match(/--dr(.*);/g).map(e=>e.split(/-|;/).flatMap(h=> [h.split(":"), h.split(":").slice(1).join(":")]).filter(n=>n).slice(1))
  let style='';
  for (var i = 0; i < settings.length; i++) {
    switch (settings[i][2][0]) {
      case "u":
        {
          const val = settings[i][3].pop()
          style+=`--dr-${settings[i][3][0]}: ${val};\n`
          
          console.log('u')
        }
        break;
      case "u":
        {
          console.log('s')
        }
        break;
      case "u":
        {
          console.log('b')
        }
        break;
      case "u":
        {
          console.log('t')
        }
        break;
    }
  }
  console.log(style);
  DrApi.styling.insert('CustomCssSettings',`:root{\n${style}}`);
  }catch(e){console.log(e)}
}

module.exports = () => {
  const {
    React, styling
  } = global?.DrApi
  const {
    webFrame: {
      top: { context:window }
    }
  } = require("electron")
  const DataStore = require("../datastore")
  const settings = DataStore("DR_DISCORD_SETTINGS")
  
  const button = DrApi.getModule(["ButtonColors"]).default
  const Switch = DrApi.getModule("Switch").default
  const Slider = DrApi.getModule(["Slider"]).default
  const TextInput = DrApi.getModule(["TextInput"])
  const Icons = require("./Icons")
  const Tooltip = DrApi.getModule.prototypes("renderTooltip").default
  
  const Flex = {
    Child: FlexChild
  } = DrApi.getModule("Flex").default
  
    class CustomCSS extends React.Component {
      constructor() {
        super()
        this.state = {
          error: false
        }
        this.ref = React.createRef()
      }
      componentDidError() {
        this.setState({ error: true })
      }
      componentDidMount() {
        if (!window?.monaco?.editor?.create) return this.setState({ error: true })
        this.editor = window.monaco.editor.create(this.ref.current, {
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
      get value() { return this.editor.getValue() }
      render() {
        return (
          this.state.error ? React.createElement("div", null, "An error accord with the monaco editor") : React.createElement("div", {
            style:{
              height:'100%',
              width:'100%',
            },
            children: [
              React.createElement("div", {
                id:"ligma",
                style:{
                  width:"100%",
                  height:"10%",
                },
                children:[
                  React.createElement(button, {
                    children:"Open css settings",
                    onClick : ()=>{

                      openSettings(this.value)
                    }
                  })
                ]
              }),
              React.createElement("div", {
                id: "monaco-editor",
                ref: this.ref
              })
            ]
          })
        )
      }
    }
  return CustomCSS
}

module.exports.openSettings = (...args) => openSettings(...args)

module.exports.openPopout = () => {
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

  const editor = window.monaco.editor.create(content.childNodes[0], {
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
  