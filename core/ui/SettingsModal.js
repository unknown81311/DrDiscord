const { info } = require("../../package.json")
const DataStore = require("../datastore")
const { ipcRenderer } = require("electron")
const {
  React
} = DrApi
const ModalElements = DrApi.find(["ModalRoot"])
const Flex = { Child:FlexChild } = DrApi.find("Flex").default
const SwitchEle = DrApi.find("SwitchItem").default
const Tooltip = DrApi.find.prototypes("renderTooltip").default
const FormTitle = DrApi.find("FormTitle").default
const Text = DrApi.find("Text").default
const TabBar = DrApi.find("TabBar").default
const Gear = DrApi.find("Gear").default
const { SingleSelect } = DrApi.find(["SingleSelect"])
const { FormItem, FormText } = DrApi.find(["FormItem", "FormText"])
const CustomCSS = require("./CustomCSS")

const settings = DataStore("DR_DISCORD_SETTINGS")

const Form = React.memo(({ title, note, children }) => {
  return React.createElement(FormItem, {
    className: "container-2_Tvc_",
    title,
    children: [
      children,
      React.createElement(FormText, {
        children: note,
        type: "description"
      }),
      React.createElement("div", { className: "divider-3573oO dividerDefault-3rvLe-"})
    ]
  });
})

const SwitchItem = React.memo(({ title, reload = false, full_reload = false, onChange, value, ...other}) => {
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
            style: { transform: "translate(4px, 2px)" },
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
  PageItem: { pi, setPI }, TabBarContent: { tbc, setTBC },
}) => {
  const [cc, setCC] = React.useState(settings.cc)
  const [transparency, setTransparency] = React.useState(settings.transparency)

  return React.createElement(React.Fragment, {
    children: [
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
      React.createElement(Form, {
        title: "Page Item's Location",
        note: "Where to show the page items",
        children: [
          React.createElement(SingleSelect, {
            options: [
              {
                label: "Above",
                value: 0
              }, 
              {
                label: "Header",
                value: 1
              }
            ],
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
            options: [
              {
                label: "Both",
                value: 0
              }, 
              {
                label: "Icons",
                value: 1
              }, 
              {
                label: "Text",
                value: 2
              }
            ],
            value: tbc || 0,
            onChange: (val) => {
              settings.TabBarContent = val
              setTBC(val)
            }
          })
        ]
      }),
    ]
  })
})

const Tabs = React.memo(({ page, setPage, TabBarContent: { tbc } }) => {
  tbc = tbc || 0
  return React.createElement(TabBar, {
    selectedItem: page,
    onItemSelect: setPage,
    itemType: TabBar.Types.TOP_PILL,
    className: ["DrDiscordSettingsTabBar", (tbc === 1) ? "IconsOnly" : null ].join(" "),
    children: [
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement(Gear) : null,
          (tbc === 0 || tbc === 2) ? "Settings" : null
        ],
        id: 0,
      }),
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement("svg", {
            fill: "currentcolor",
            viewBox: "0 0 24 24",
            children: React.createElement("path", {
              d: "M20,20H4c-1.105,0-2-0.895-2-2V9c0-1.105,0.895-2,2-2h1V5c0-0.552,0.448-1,1-1h4c0.552,0,1,0.448,1,1v2h2V5 c0-0.552,0.448-1,1-1h4c0.552,0,1,0.448,1,1v2h1c1.105,0,2,0.895,2,2v9C22,19.105,21.105,20,20,20z"
            })
          }) : null,
          (tbc === 0 || tbc === 2) ? "Plugins" : null
        ],
        id: 1,
      }),
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement("svg", {
            fill: "currentcolor",
            viewBox: "0 0 24 24",
            children: React.createElement("path", {
              d: "M 7.15625 3.0292969 C 6.3771406 3.0476719 5.6462969 3.5239219 5.3417969 4.2949219 L 4.2714844 7 L 17.623047 7 L 7.9375 3.1699219 C 7.68075 3.0684219 7.4159531 3.0231719 7.15625 3.0292969 z M 5 9 C 3.897 9 3 9.897 3 11 L 3 19 C 3 20.103 3.897 21 5 21 L 19 21 C 20.103 21 21 20.103 21 19 L 21 11 C 21 9.897 20.103 9 19 9 L 5 9 z M 17 11 L 18 11 C 18.552 11 19 11.448 19 12 L 19 18 C 19 18.552 18.552 19 18 19 L 17 19 C 16.448 19 16 18.552 16 18 L 16 12 C 16 11.448 16.448 11 17 11 z"
            })
          }) : null,
          (tbc === 0 || tbc === 2) ? "Themes" : null
        ],
        id: 2,
      }),
      React.createElement(TabBar.Item, {
        children: [
          (tbc <= 1) ? React.createElement("svg", {
            fill: "currentcolor",
            viewBox: "0 0 50 50",
            children: React.createElement("path", {
              d: "M 31.148438 -0.0625 L 12.121094 18.964844 C 11.828125 19.253906 11.746094 19.695313 11.910156 20.070313 C 13.597656 23.914063 14.882813 28.789063 14.039063 29.632813 C 12.15625 31.515625 10.292969 32.285156 8.492188 33.03125 C 7.011719 33.644531 5.609375 34.226563 4.472656 35.363281 C 0.640625 39.195313 -1.546875 45.554688 1.445313 48.550781 C 2.359375 49.460938 3.667969 49.941406 5.238281 49.941406 C 8.265625 49.941406 11.953125 48.210938 14.636719 45.527344 C 15.886719 44.277344 16.804688 42.339844 17.695313 40.46875 C 18.515625 38.746094 19.359375 36.96875 20.363281 35.964844 C 20.613281 35.71875 21.105469 35.589844 21.796875 35.589844 C 24.839844 35.589844 29.832031 38.046875 29.882813 38.070313 C 30.269531 38.261719 30.730469 38.1875 31.035156 37.882813 L 36.371094 32.542969 L 44.925781 23.988281 C 44.964844 23.957031 45.015625 23.914063 45.039063 23.890625 C 45.050781 23.878906 45.054688 23.859375 45.066406 23.847656 L 50.0625 18.851563 Z M 7 45 C 5.894531 45 5 44.105469 5 43 C 5 41.898438 5.894531 41 7 41 C 8.105469 41 9 41.898438 9 43 C 9 44.105469 8.105469 45 7 45 Z M 36.371094 29.714844 L 20.285156 13.628906 L 23.152344 10.761719 C 23.308594 11.242188 23.59375 11.707031 24.027344 12.144531 C 25.898438 14.011719 29.164063 12.085938 29.800781 11.679688 C 32.054688 10.246094 33.023438 10.28125 33.113281 10.332031 C 33.25 10.613281 33.164063 11.53125 31.996094 14.292969 L 31.917969 14.476563 C 30.910156 16.867188 31.84375 18.304688 32.484375 18.953125 C 33.546875 20.011719 35.027344 19.640625 36.214844 19.339844 C 37.277344 19.074219 38 18.925781 38.351563 19.277344 C 38.785156 19.710938 38.5 20.792969 38.246094 21.746094 C 37.933594 22.9375 37.609375 24.164063 38.449219 25.007813 C 38.980469 25.539063 39.617188 25.765625 40.277344 25.808594 Z"
            })
          }) : null,
          (tbc === 0 || tbc === 2) ? "Custom CSS" : null
        ],
        id: 3,
      })
    ]
  })
})

module.exports = React.memo(({mProps, PAGE}) => {
  const [pi, setPI] = React.useState(settings.PageItem)
  const [page, setPage] = React.useState(PAGE || 0)
  const [tbc, setTBC] = React.useState(settings.TabBarContent)
  
  return React.createElement(ModalElements.ModalRoot, {
    ...mProps,
    size: ModalElements.ModalSize.LARGE,
    children: [
      ((pi || 0) === 0) ? React.createElement("div", {
        className: "DrDiscordSettingsTabBarWrapper",
        children: React.createElement(Tabs, { page, setPage, TabBarContent: { tbc } })
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
              pi === 1 ? React.createElement(Tabs, { page, setPage, TabBarContent: { tbc } }) : null,
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
        children: [
          page === 0 ? React.createElement(DrSettings, {
            PageItem: { pi, setPI },
            TabBarContent: { tbc, setTBC }
          }) : page === 1 ? React.createElement(Text, null, "PLUGIN PAGE") : page === 2 ? React.createElement(Text, null, "THEME PAGE") : page === 3 ? React.createElement(CustomCSS) : null,
        ]
      })
    ]
  })
})