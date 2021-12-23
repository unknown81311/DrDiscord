const MiniPopover = DrApi.find("MiniPopover")

const plugin = {
  onStart: () => {
    DrApi.patch("reportMessages", MiniPopover, "default", ([args]) => {
      const child = args.children.find(e => e?.type)
      if (child) child.props.canReport = true
    })
  },
  onStop: () => DrApi.patch.unpatchAll("reportMessages")
}
const meta = {
  name: "reportMessages",
  version: "1.0.0",
  author: "Doggybootsy",
  description: "Adds the ability to report messages to Discord"
}

module.exports = { plugin, meta }