const _fs = require("fs");
const _path = require("path");

let DiscordInfo = ["Discord","1.0.9003"] // Wont always be this version need to find latested depending on OS

if (process.argv.includes("DISCORD=")) DiscordInfo = process.argv[process.argv.indexOf("DISCORD=") + 1].split("=");

let PATH = process.platform === "darwin" ? `/Applications/${DiscordInfo[0]}.app/Contents/Resources`
  : process.platform === "win32" ? _path.join(process.env.HOME, "AppData/Local", DiscordInfo[0], `/app-${DiscordInfo[1]}/resources`)
  : console.error("Linux doesnt have a path yet")

if (process.argv.includes("--install")) {
  if (!_fs.existsSync(PATH)) return console.error("Discord isn't installed")
  if (!_fs.existsSync(_path.join(PATH, "app"))) _fs.mkdirSync(_path.join(PATH, "app"))

  _fs.writeFileSync(_path.join(PATH, "app/package.json"), JSON.stringify({ main:"index.js", name:"discord" }))
  _fs.writeFileSync(_path.join(PATH, "app/index.js"), `require("${_path.join(__dirname).replace("\\", "\\\\")}")`)
}

if (process.argv.includes("--uninstall")) _fs.rmdirSync(_path.join(PATH, "app"), { recursive: true })