const {/* Look at 470 for the icon that I cnat fix and look at 94 for the weird eval shit*/
  info
} = require("../../package.json")
const DataStore = require("../datastore")
const {
  ipcRenderer,
  shell,
  webFrame: {
    top: {
      context: window
    }
  }
} = require("electron")
const _fs = require("fs")
const _path = require("path")
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
} = DrApi
const ModalElements = DrApi.find(["ModalRoot"])
const Flex = {
  Child: FlexChild
} = DrApi.find("Flex").default
const SwitchEle = DrApi.find("SwitchItem").default
const Tooltip = DrApi.find.prototypes("renderTooltip").default
const FormTitle = DrApi.find("FormTitle").default
const Text = DrApi.find("Text").default
const TabBar = DrApi.find("TabBar").default
const Gear = DrApi.find("Gear").default
const {
  SingleSelect
} = DrApi.find(["SingleSelect"])
const {
  FormItem,
  FormText
} = DrApi.find(["FormItem", "FormText"])
const Button = DrApi.find(["ButtonColors"])
const Switch = DrApi.find("Switch").default
const Icons = require("./Icons")
const TextInput = DrApi.find("TextInput").default

const CustomCSS = require("./CustomCSS")

let enableCJS


const settings = DataStore("DR_DISCORD_SETTINGS")

DrApi.styling.insert("custom-js-spin", '@keyframes customJSspin{from{transform:rotate(0deg)}to{transform:rotate(180deg)}}#custom-js-refresh:hover{animation: customJSspin 250ms linear}')

class CustomJS extends React.Component {
  constructor() {
    super()
  }

  componentDidMount() {
    this.editor = window.monaco.editor.create(window.document.getElementById("custom-js"), {
      language: "javascript",
      theme: document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light",
      value: settings._JS,
    })
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue()
      DataStore.setData("DR_DISCORD_SETTINGS", "_JS", value)
      if (global.FloatingCSSEditor) FloatingCSSEditor.setValue(value)
    })
    const contextmenu = this.editor.getContribution('editor.contrib.contextmenu')
    contextmenu._onContextMenu = _ => _

  }

  render() {
    return React.createElement("div", {
        id: "custom-js-wrapper",
        style: {
          height: '100%'
        }
      },
      React.createElement("svg", {
        id: "custom-js-refresh",
        onClick: () => {
          if (window.document.getElementById("custom-js").textContent.includes("token")) {
            DrApi.showConfirmationModal('WAIT!', [`Are you sure you want to exicute this script?`, `This script contains the keyword token and could use it for maliciousways!`], {
              cancelText: "NO!",
              onConfirm: () => {
                DrApi.modal.functions.closeAllModals()
              },
              confirmText: "yes, im sure",
              onConfirm: () => {
                try {
                  require("module").prototype._compile(DrApi.DataStore("DR_DISCORD_SETTINGS")._JS,'CustomJS')
                } catch (e) {
                  DrApi.showConfirmationModal('Custom JS Error:', [String(e)],{cancelText:null})
                }
              }
            })
          } else {
            try {
              require("module").prototype._compile(DrApi.DataStore("DR_DISCORD_SETTINGS")._JS,'CustomJS')
            } catch (e) {
              DrApi.showConfirmationModal('Custom JS Error:', [String(e)],{cancelText:null})
            }
          }
        },
        fill: "currentcolor",
        viewBox: "0 0 24 24",
        style: {
          height: '24px',
          cursor: 'pointer',
          color: 'var(--interactive-normal)',
          "margin-bottom": '5px',
          "transform-origin": 'center',

        },
        children: React.createElement("path", {
          d: "M9 12l-4.463 4.969-4.537-4.969h3c0-4.97 4.03-9 9-9 2.395 0 4.565.942 6.179 2.468l-2.004 2.231c-1.081-1.05-2.553-1.699-4.175-1.699-3.309 0-6 2.691-6 6h3zm10.463-4.969l-4.463 4.969h3c0 3.309-2.691 6-6 6-1.623 0-3.094-.65-4.175-1.699l-2.004 2.231c1.613 1.526 3.784 2.468 6.179 2.468 4.97 0 9-4.03 9-9h3l-4.537-4.969z"
        })
      }),
      React.createElement("div", {
        id: "custom-js",
        style: {
          height: '100%'
        }
      })
    )
  }
}

const Card = React.memo((props) => {
  const {
    meta,
    type
  } = props

  const [enabled, setEnabled] = React.useState(DrApi[type].isEnabled(meta.name))
  return React.createElement("div", {
    className: "DrDiscord-card",
    type,
    id: meta.name,
    children: [
      React.createElement("div", {
        className: "DrDiscord-card-header-wrapper",
        children: React.createElement("div", {
          className: "DrDiscord-card-header",
          children: [
            React.createElement("div", {
              className: "DrDiscord-card-header-top",
              children: [
                React.createElement("div", {
                  className: "DrDiscord-card-header-name",
                  children: meta.name
                }),
                React.createElement("div", {
                  className: "DrDiscord-card-header-version",
                  children: `v${meta.version}`
                }),
              ]
            }),
            React.createElement("div", {
              className: "DrDiscord-card-header-author",
              children: meta.author
            })
          ]
        })
      }),
      React.createElement("div", {
        className: "DrDiscord-card-content-wrapper",
        children: React.createElement("div", {
          className: "DrDiscord-content-footer",
          children: meta.description
        })
      }),
      React.createElement("div", {
        className: "DrDiscord-card-footer-wrapper",
        children: React.createElement("div", {
          className: "DrDiscord-card-footer",
          children: [
            React.createElement("div", {
              className: "DrDiscord-card-footer-left",
              children: [!props.plugin ? null : (typeof props.plugin.onSettings === "function" && enabled) ? React.createElement("div", {
                className: "DrDiscord-card-footer-left-settings",
                onClick: () => props.setContent(props.plugin.onSettings())
              }, React.createElement(Tooltip, {
                text: "Settings",
                children: (ttProps) => React.createElement(Gear, ttProps)
              })) : null]
            }),
            React.createElement("div", {
              className: "DrDiscord-card-footer-switch",
              children: React.createElement(Switch, {
                checked: enabled,
                onChange: () => {
                  DrApi[type].toggle(meta.name)
                  setEnabled(!enabled)
                }
              })
            })
          ]
        })
      }),
    ]
  })
})

const Updater = React.memo(() => {
  const [updating, setUpdating] = React.useState(0)
  return React.createElement("div", {
    children: [
      React.createElement(Text, {}, "Updating will RESTART the Discord client. "),
      React.createElement(Button.default, {
        children: updating === 0 ? "Update" : updating === 1 ? "Updating..." : updating === 2 ? "Updated" : "Up to date",
        onClick: () => {
          setUpdating(1)
          DrApi.updateDrDiscord()
        },
      })
    ]
  })
})

const Form = React.memo(({
  title,
  note,
  children
}) => {
  return React.createElement(FormItem, {
    className: "container-2_Tvc_",
    title,
    children: [
      children,
      React.createElement(FormText, {
        children: note,
        type: "description"
      }),
      React.createElement("div", {
        className: "divider-3573oO dividerDefault-3rvLe-"
      })
    ]
  });
})

const SwitchItem = React.memo(({
  title,
  reload = false,
  full_reload = false,
  onChange,
  value,
  ...other
}) => {
  const [reloading, setReloading] = React.useState(false)
  return React.createElement(SwitchEle, {
    children: [
      title,
      (reload || full_reload) ? React.createElement(Tooltip, {
        children: (ttProps) => {
          const oldTtOnClick = ttProps.onClick
          ttProps = {
            ...ttProps,
            onClick: (...args) => {
              setReloading(true)
              setTimeout(() => (full_reload ? (() => ipcRenderer.invoke("RESTART_DISCORD")) : location.reload)(), 120)
                // To not allow it to revert
              onChange(!value)
              oldTtOnClick.apply(this, args)
            }
          }
          return React.createElement("svg", {
            fill: "#fff",
            viewBox: "2 2 20 20",
            width: "16",
            height: "16",
            className: `SwitchItemReloadIcon ${reloading ? "reloading" : ""}`,
            style: {
              transform: "translate(4px, 2px)"
            },
            children: React.createElement("path", {
              d: "M17.65,6.35 C16.2,4.9 14.21,4 12,4 C7.58,4 4.01,7.58 4.01,12 C4.01,16.42 7.58,20 12,20 C15.73,20 18.84,17.45 19.73,14 L17.65,14 C16.83,16.33 14.61,18 12,18 C8.69,18 6,15.31 6,12 C6,8.69 8.69,6 12,6 C13.66,6 15.14,6.69 16.22,7.78 L13,11 L20,11 L20,4 L17.65,6.35 L17.65,6.35 Z"
            }),
            ...ttProps
          })
        },
        text: reloading ? "Reloading..." : "Reload for changes to apply"
      }) : null
    ],
    value,
    onChange,
    ...other
  })
})

const DrSettings = React.memo(({
  PageItem: {
    pi,
    setPI
  },
  TabBarContent: {
    tbc,
    setTBC
  },
}) => {
  const [cc, setCC] = React.useState(settings.cc)
  const [transparency, setTransparency] = React.useState(settings.transparency)
  const [isDeveloper, setIsDeveloper] = React.useState(DrApi.isDeveloper)
  const [minimalMode, setMinimalMode] = React.useState(settings.minimalMode)
  const [customJS, setCustomJS] = React.useState(settings.cjs)
  return React.createElement(React.Fragment, {
    children: [
      React.createElement(Form, {
        title: "Page Item's Location",
        note: "Where to show the page items",
        children: [
          React.createElement(SingleSelect, {
            options: [{
              label: "Above",
              value: 0
            }, {
              label: "Header",
              value: 1
            }],
            value: pi || 0,
            onChange: (val) => {
              settings.PageItem = val
              setPI(val)
            }
          })
        ]
      }),
      React.createElement(Form, {
        title: "Tabbar item's",
        note: "Show only the icons or text or even both",
        children: [
          React.createElement(SingleSelect, {
            options: [{
              label: "Both",
              value: 0
            }, {
              label: "Icons",
              value: 1
            }, {
              label: "Text",
              value: 2
            }],
            value: tbc || 0,
            onChange: (val) => {
              settings.TabBarContent = val
              setTBC(val)
            }
          })
        ]
      }),
      React.createElement(SwitchItem, {
        title: "Enable Developer Mode",
        note: "Warning you can get banned from Discord if you do this (not a 100% chance)!",
        value: isDeveloper,
        onChange: (val) => {
          settings.isDeveloper = val
          setIsDeveloper(val)
          DrApi.isDeveloper = val
        }
      }),
      React.createElement(SwitchItem, {
        title: "Minimal Mode",
        note: "May cause issues with themes",
        value: minimalMode,
        onChange: (val) => {
          settings.minimalMode = val
          document.body.classList.toggle("minimal-mode")
          setMinimalMode(val)
        }
      }),
      React.createElement(SwitchItem, {
        title: "Load Cumcord",
        note: "Load's Cumcord with DrDiscord, doesn't download anything",
        value: cc,
        reload: true,
        onChange: (val) => {
          settings.cc = val
          setCC(val)
        }
      }),
      React.createElement(SwitchItem, {
        title: "Transparency",
        note: "Makes the window transparent, REMOVES WINDOW SNAPPING!",
        value: transparency,
        full_reload: true,
        onChange: (val) => {
          settings.transparency = val
          setTransparency(val)
        }
      }),
      React.createElement(SwitchItem, {
        title: "Enable Custom JS",
        note: "Warning enabling thins allows you to easily add a malisious script that gets ran. Be careful!",
        value: customJS,
        onChange: (val) => {
          settings.cjs = val
          setCustomJS(val)
        }
      }),
    ]
  })
})

const Tabs = React.memo(({
  page,
  setPage,
  TabBarContent: {
    tbc
  },
  setContent
}) => {
  return React.createElement(TabBar, {
    selectedItem: page,
    onItemSelect: (e) => {
      setPage(e)
      setContent(null)
    },
    itemType: TabBar.Types.TOP_PILL,
    className: ["DrDiscordSettingsTabBar", (tbc === 1) ? "IconsOnly" : null].join(" "),
    children: [
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement(Gear) : null,
          (tbc === 0 || tbc === 2) ? React.createElement("span", null, "Settings") : null
        ],
        id: 0,
      }),
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement(Icons.Plugins) : null,
          (tbc === 0 || tbc === 2) ? React.createElement("span", null, "Plugins") : null
        ],
        id: 1,
      }),
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement(Icons.Themes) : null,
          (tbc === 0 || tbc === 2) ? React.createElement("span", null, "Themes") : null
        ],
        id: 2,
      }),
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement(Icons.CustomCSS) : null,
          (tbc === 0 || tbc === 2) ? React.createElement("span", null, "Custom CSS") : null
        ],
        id: 3,
      }),
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement(Icons.Updater) : null,
          (tbc === 0 || tbc === 2) ? React.createElement("span", null, "Updater") : null
        ],
        id: 4,
      }),
      React.createElement(TabBar.Item, {
        children: [
          // (tbc <= 1 && (DrApi.DataStore("DR_DISCORD_SETTINGS").cjs||false)) ? React.createElement(Icons.CustomJS) : null,
          (tbc === 0 || tbc === 2 && (DrApi.DataStore("DR_DISCORD_SETTINGS").cjs || false)) ? React.createElement("span", null, "Custom JS") : null
        ],
        id: 5,
      })
    ]
  })
})

class Themes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      url: ""
    }
  }
  render() {
    const Themes = DrApi.Themes.getAll()
    return React.createElement("div", {
      children: [
        React.createElement("div", {
          className: "DrDiscordSettingsTop",
          children: [
            React.createElement(Button.default, {
              children: "Open Folder",
              onClick: () => shell.openPath(DrApi.Themes.folder)
            }),
            React.createElement("div", {
              children: [
                React.createElement(TextInput, {
                  placeholder: "URL",
                  value: this.state.url,
                  onChange: (val) => this.setState({
                    url: val
                  })
                }),
                React.createElement(Button.default, {
                  children: "Install",
                  onClick: () => {
                    const FileName = this.state.url.split('/').pop().split('#')[0].split('?')[0]
                    if (!(!FileName.endsWith(".css") || !FileName.endsWith(".scss"))) return
                    DrApi.request(this.state.url, (err, _, body) => {
                      if (err) throw new Error("Failed to install plugin")
                      _fs.writeFileSync(_path.join(DrApi.Themes.folder, FileName), body, "utf8")
                      this.setState({
                        url: ""
                      })
                    })
                  }
                })
              ]
            })
          ]
        }),
        React.createElement("div", {
          className: "DrDiscordSettingsAddons",
          children: [
            Themes.map(theme => React.createElement(Card, {
              ...theme,
              type: "Themes",
            }))
          ]
        })
      ]
    })
  }
}
class Plugins extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      url: ""
    }
  }
  render() {
    const Plugins = DrApi.Plugins.getAll()
    return React.createElement("div", {
      children: [
        React.createElement("div", {
          className: "DrDiscordSettingsTop",
          children: [
            React.createElement(Button.default, {
              children: "Open Folder",
              onClick: () => shell.openPath(DrApi.Plugins.folder)
            }),
            React.createElement("div", {
              children: [
                React.createElement(TextInput, {
                  placeholder: "URL",
                  value: this.state.url,
                  onChange: (val) => this.setState({
                    url: val
                  })
                }),
                React.createElement(Button.default, {
                  children: "Install",
                  onClick: () => {
                    const FileName = this.state.url.split('/').pop().split('#')[0].split('?')[0]
                    if (!(!FileName.endsWith(".js"))) return
                    DrApi.request(this.state.url, (err, _, body) => {
                      if (err) throw new Error("Failed to install plugin")
                      _fs.writeFileSync(_path.join(DrApi.Plugins.folder, FileName), body, "utf8")
                      this.setState({
                        url: ""
                      })
                    })
                  }
                })
              ]
            })
          ]
        }),
        React.createElement("div", {
          className: "DrDiscordSettingsAddons",
          children: [
            Plugins.map(theme => React.createElement(Card, {
              ...theme,
              type: "Plugins",
              setContent: this.props.setContent
            }))
          ]
        })
      ]
    })
  }
}
module.exports = React.memo(({
  mProps,
  PAGE,
  reactElement
}) => {
  const [pi, setPI] = React.useState(settings.PageItem || 0)
  const [page, setPage] = React.useState(PAGE || 0)
  const [tbc, setTBC] = React.useState(settings.TabBarContent === 0 ? 0 : settings.TabBarContent)
  const [content, setContent] = React.useState(reactElement)

  return React.createElement(ModalElements.ModalRoot, {
    ...mProps,
    className: "DrDiscordSettingsModal",
    size: ModalElements.ModalSize.LARGE,
    children: [
      (pi === 0) ? React.createElement("div", {
        className: "DrDiscordSettingsTabBarWrapper",
        children: React.createElement(Tabs, {
          page,
          setPage,
          TabBarContent: {
            tbc
          },
          setContent
        })
      }) : null,
      React.createElement(ModalElements.ModalHeader, {
        separator: false,
        children: [
          React.createElement(Flex, {
            children: [
              React.createElement(FlexChild, {
                children: [
                  React.createElement(FlexChild, {
                    children: React.createElement(FormTitle, {
                      children: [info.name],
                      tag: FormTitle.Tags.H4
                    })
                  }),
                  React.createElement(FlexChild, {
                    children: React.createElement(Text, {
                      children: ["v", info.version],
                    })
                  })
                ]
              }),
              pi === 1 ? React.createElement(Tabs, {
                page,
                setPage,
                TabBarContent: {
                  tbc
                },
                setContent
              }) : null,
              React.createElement(FlexChild, {
                children: React.createElement(ModalElements.ModalCloseButton, {
                  onClick: mProps.onClose
                })
              })
            ]
          }),
        ]
      }),
      React.createElement(ModalElements.ModalContent, {
        dataPage: page,
        children: [!content ? page === 0 ? React.createElement(DrSettings, {
          PageItem: {
            pi,
            setPI
          },
          TabBarContent: {
            tbc,
            setTBC
          }
        }) : page === 1 ? React.createElement(Plugins, {
          setContent
        }) : page === 2 ? React.createElement(Themes) : page === 3 ? React.createElement(CustomCSS) : page === 4 ? React.createElement(Updater) : page === 5 && (DrApi.DataStore("DR_DISCORD_SETTINGS").cjs || false) ? React.createElement(CustomJS) : null : content, ]
      })
    ]
  })
})
