class testPlugin {
  onStart() {
    console.log("testPlugin started")
  }
  static onStop() {
    console.log("testPlugin stopped")
  }
  onLoad() {
    console.log("testPlugin loaded")
  }
}
// Place at the end of your plugin's code
window.DrApi.plugins.push(testPlugin, {
  name: "Plugin Name",
  description: "Plugin Description",
  version: "Plugin Version",
  author: "Plugin Author"
})