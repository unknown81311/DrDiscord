const {
  webFrame: {
    top: {
      context: window
    }
  }
} = require("electron")
module.exports = () => {
  const {
    React,
    styling,
    modal: {
      functions: {
        openModal
      },
      elements: {
        ModalRoot,
        ModalContent,
        ModalFooter,
        ModalHeader,
        ModalSize
      }
    }
  } = global?.DrApi
  const DataStore = require("../datastore")
  const settings = DataStore("DR_DISCORD_SETTINGS")
  const button = DrApi.getModule(["ButtonColors"]).default
  const ButtonColors = DrApi.getModule(["ButtonColors"]).ButtonColors
  const Switch = DrApi.getModule("Switch").default
  const Slider = DrApi.getModule.displayName("Slider").default
  const colorPicker = DrApi.getModule(['CustomColorPicker']).default
  const TextInput = DrApi.getModule("TextInput").default
  const Icons = require("./Icons")
  const Tooltip = DrApi.getModule.prototypes("renderTooltip").default
  const text = DrApi.getModule("ListSectionItem").default
  const subText = DrApi.getModule("Text").default
  const markDown = DrApi.getModule(m => m.default?.displayName === "Markdown" && m.default.rules).default
  let FormTitle = DrApi.getModule("FormTitle").default
  const Flex = {
    Child: FlexChild
  } = DrApi.getModule("Flex").default

  function updateCSSS(){
    let 
      data = DataStore("DR_DISCORD_SETTINGS").csss||{},
      style = '';
    for (a in data) {
      style+=`--dr-${a}:${data[a]};`
    }
    DrApi.styling.update('csss',`:root{${style}}`)
  }
  updateCSSS()

  function openSettings(css) { 
    let style = DataStore("DR_DISCORD_SETTINGS").csss||{};
    setVal=(ID,VAL,DEFAULT)=>{
      style[ID]=VAL||DEFAULT;
      DataStore.setData("DR_DISCORD_SETTINGS", "csss", style)
      updateCSSS();
    }
    try {
      const settings = css.match(/:root( +|){((.|\n)*)}/)[0].match(/--dr(.*);/g).map(e => e.split(/-|;/).flatMap(h => [h.split(":")[0], h.split(":").slice(1).join(":")]).filter(n => n).slice(1))
      
      let reactElms = [];
      for (var i = 0; i < settings.length; i++) {
        const set = settings[i]
        switch (set[0]) {
          case 't':
            {
              reactElms.push(React.createElement("div",{
                style:{
                  padding:"10px"
                },
                children:[
                  React.createElement(text,{ children: ["value for:"+set[1]] }),
                  React.createElement(TextInput,{
                    onInput:e=>{
                      setVal(set[1],e.target.value,set[2])
                    },
                    placeholder:style[set[1]]||set[2]
                  })
                ]
              }))
            }
            break;
          case 's':
            { 
              let lastValue=set[set.length-1]
              let markes=set.slice(0,-1)
              reactElms.push(React.createElement("div",{
                style:{
                  padding:"10px"
                },
                children:[
                  React.createElement(text,{
                    children: ["value for:"+set.slice(-2,-1)[0]]
                  }),
                  React.createElement('div',{style:{'margin': '8px'}}),
                    React.createElement(Slider,{
                      initialValue: style[set.slice(-2,-1)[0]]||lastValue,
                      defaultValue: lastValue,
                      markers: set.slice(1,-2),
                      stickToMarkers: true,
                      minValue: set[1],
                      maxValue: lastValue,
                      handleSize: 10,
                      onValueChange: (e)=> setVal(set.slice(-2,-1)[0],e,lastValue)
                    })
                  ]
              }))
            }
            break;
          case 'b':
            {
              reactElms.push(React.createElement("div",{
                style:{
                  padding:"10px"
                },
                children:[
                  React.createElement(text,{ children: ["value for:"+set[1]] }),
                  React.createElement(React.memo(() => {
                    let [enabled, setEnabled] = React.useState(style[set[1]]===true||parseFloat(set[2]))
                    return [React.createElement(Switch, {
                      checked:enabled,
                      onChange:e=>{
                        setEnabled(!enabled);
                        setVal(set[1],enabled,parseFloat(set[2]));
                      }
                    })]
                  }),{})
                ]
              }))
            }
            break;
           case 'h'://hue
              {
                // reactElms.push(
                //   React.createElement("div",{
                //     style:{
                //       padding:"10px"
                //     },
                //     children: [
                //     React.createElement(text,{ children: ["value for:"+set[1]] }),
                //     React.createElement(colorPicker,{
                //       "position": "right",
                //       "isPositioned": true,
                //       // "value": 1752220,
                //       "colors": [1752220],
                //       'renderDefaultButton':(e)=>{
                //         React.createElement(e,{})
                //       },
                //       'colorContainerClassName':(e)=>{
                //         React.createElement(e,{})
                //       },
                //       // 'renderDefaultButton':(e)=>{
                //       //   React.createElement(e,{})
                //       // },
                //     })]
                //   }))
              }
            break;
        }
      }
      try{
      let moduleID=openModal(props => {
        return React.createElement(ModalRoot, {
          ...props,
          size: ModalSize.SMALL,
          children: [
            React.createElement(ModalHeader, {
              separator: false,children: [
                React.createElement(Flex, {
                  className: "csss-viwer-wrapper",
                  style:{
                    width:'100%'
                  },
                  children:[
                    React.createElement(FlexChild, {
                      style:{
                        display: 'flex',
                        'justify-content': 'space-between',
                        width: '100%'
                      },
                      children: 
                        React.createElement('div',{
                          children: [
                            React.createElement('div',{
                              children: [
                                React.createElement(FormTitle, {
                                  children: `Custom Css Settings`,
                                  tag: FormTitle.Tags.H4
                                }),
                                React.createElement(subText,{
                                  className:"anchor-1MIwyf anchorUnderlineOnHover-2qPutX",
                                  onClick:()=>{
                                    DrApi.showConfirmationModal(
                                      'Tutorial',[
                                        '⦾ sythax:',
                                        '\`--dr-<type>-<properties>-<ID>:<default value>;\`',
                                        '⦾ types:',
                                        '\`t\` **:** \`adds a setting for a text input\`',
                                        '\`b\` **:** \`adds a setting for a toggle\`',
                                        '\`s\` **:** \`adds a setting for a slider\`',
                                        '\`h\` **:** \`adds a setting for a color picker\`',
                                        '⦾ how it works:',
                                        'parses the css and pulls the vareables in the `:root{}` selectors and converts them to a new vareable using the settings.',
                                        '⦾ examples:',
                                        '```css\n:root{\n  --dr-t-Text:"Defalt Text";\n}```',
                                        'this will convert the vareable to `--dr-Text:"Defalt Text";`\n or it will use the value the user inputed in the settings.',
                                        '```css\n:root{\n  --dr-b-Toggle:1;\n}```',
                                        'this will convert the vareable to `--dr-Toggle:1`;\n or it will use the value the user inputed in the settings.',
                                        '```css\n:root{\n  --dr-s-0-1-2-3-4-5-Slider:5;\n}```',
                                        'this will convert the vareable to `--dr-Slider:5;`\n or it will use the value the user inputed in the settings.',
                                        '```css\n:root{\n  --dr-h-color:#ffffff;\n}```',
                                        'this will convert the vareable to `--dr-color:#ffffff;`\n or it will use the value the user inputed in the settings.'
                                        
                                        ],{
                                        cancelText:null, confirmText:'close'
                                      })
                                  },
                                  children:"how does this work?!"
                                })
                              ]
                            }),
                            React.createElement(button,{
                              children:'reset',
                              className:ButtonColors.RED,
                              onClick:()=>{
                                DrApi.modal.functions.closeModal(moduleID);
                                DataStore.setData("DR_DISCORD_SETTINGS", "csss", {});
                              }
                            })
                          ]
                        })
                    })
                  ]
                })
              ]
            }),
            React.createElement("div",{
              style:{height: '100%'},
              children:[...reactElms]
            })
          ]
        })
      })
      }catch(e){console.log(e)}
    } catch (e) {
      console.log(e)
    }
  }

  class CustomCSS extends React.Component {
    constructor() {
      super()
      this.state = {
        error: false
      }
      this.ref = React.createRef()
    }
    componentDidError() {
      this.setState({
        error: true
      })
    }
    componentDidMount() {
      if (!window?.monaco?.editor?.create) return this.setState({
        error: true
      })
      this.editor = window.monaco.editor.create(this.ref.current, {
        language: "scss",
        theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
        value: settings.CSS,
      })
      this.editor.onDidChangeModelContent(() => {
        const value = this.editor.getValue()
        DataStore.setData("DR_DISCORD_SETTINGS", "CSS", value)
        window.document.getElementById("CUSTOMCSS").textContent = styling.compileSass(value)
        if (global.FloatingCSSEditor) FloatingCSSEditor.setValue(value);
        updateCSSS();
      })
      const contextmenu = this.editor.getContribution('editor.contrib.contextmenu')
      contextmenu._onContextMenu = _ => _
    }
    render() {
      updateCSSS();
      return (
        this.state.error ? React.createElement("div", null, "An error accord with the monaco editor") : React.createElement("div", {
          style: {
            height: '100%',
            width: '100%',
          },
          children: [
            React.createElement("div", {
              style: {
                width: "100%",
                height: "10%",
                padding: "3px"
              },
              children: [
                React.createElement(button, {
                  className:ButtonColors.GREEN,
                  children: "Open css settings",
                  onClick: () => {
                    openSettings(this.editor.getValue())
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

  header.onmousedown = ({
    clientX,
    clientY
  }) => {
    const {
      x,
      y,
      width,
      height
    } = div.getBoundingClientRect()

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
    try {
      global.DrApi.customCSS.update(editor.getValue())
    } catch (e) {
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
