const MiniPopover = DrApi.find("MiniPopover")
let remove = () => {}
module.exports = {
  onStart: () => {
    remove = DrApi.patch(MiniPopover, "default", ([args]) => {
      const child = args.children.find(e => typeof e?.props?.canReport === "boolaen")
      if (child) child.props.canReport = true
    })
  },
  onStop: remove
}