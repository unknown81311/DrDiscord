/**
 * @name DataAttr
 * @description Add data attributes to elements
 * @author Dr.Discord
 * @version 1.0.0
 * @license MIT
 * @ignore false
 */

let release = DiscordNative.app.getReleaseChannel()
let Flux

let { getCurrentUser } = DrApi.getModule(["getCurrentUser"])
let { getChannelId } = DrApi.getModule(["getLastSelectedChannelId", "getChannelId"])
let { getGuildId } = DrApi.getModule(["getLastSelectedGuildId"])

module.exports = new class {
  get currentUser() { return getCurrentUser() }
  get channelId() { return getChannelId() }
  get guildId() { return getGuildId() }
  get platform() { return window.process?.platform ?? "unknown" }

  Guild_Channel_Attr({ channelId, guildId }) {
    // Location
    document.body.setAttribute("data-location", location.pathname) 
    // Guild
    if (guildId) document.body.setAttribute("data-guild-id", guildId) 
    else document.body.removeAttribute("data-guild-id")
    // Channel
    if (channelId) document.body.setAttribute("data-channel-id", channelId) 
    else document.body.removeAttribute("data-channel-id")
  }
  async onStart() {
    // Add attributes
    document.body.setAttribute("data-platform", this.platform) 
    document.body.setAttribute("data-location", location.pathname) 
    document.body.setAttribute("data-release", release) 
    document.body.setAttribute("data-current-user-id", this.currentUser.id) 
    this.Guild_Channel_Attr({ channelId: this.channelId, guildId: this.currentGuild })
    // Add listener for channel change
    Flux = await DrApi.util.waitUntil(DrApi.FluxDispatcher)
    Flux.subscribe("CHANNEL_SELECT", this.Guild_Channel_Attr)
  }
  async onStop() {
    // Remove attributes
    for (const data of [
      "data-guild-id", "data-channel-id", 
      "data-current-user-id", "data-location", 
      "data-release", "data-platform"
    ]) {
      document.body.removeAttribute(data)
    }
    // Remove listener for channel change
    Flux = await DrApi.util.waitUntil(DrApi.FluxDispatcher)
    Flux.unsubscribe("CHANNEL_SELECT", this.Guild_Channel_Attr)
  }
}