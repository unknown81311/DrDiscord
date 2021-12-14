const MiniPopover = DrApi.find("MiniPopover")
let remove = () => {}
const plugin = {
  onStart: () => {
    remove = DrApi.patch(MiniPopover, "default", ([args]) => {
      const child = args.children.find(e => typeof e?.props?.canReport === "boolaen")
      if (child) child.props.canReport = true
    })
  },
  onStop: remove
}
const meta = {
  name: "reportMessages",
  version: "1.0.0",
}


// concept 1
module.exports = { plugin, meta }
// concept 2
new DrApi.Plugin({ plugin, meta })
// concept 3
return { plugin, meta }