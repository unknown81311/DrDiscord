import { 
  findModule, 
  findModuleByProps, 
  findModuleByDisplayName, 
  findAllModules, 
  React, 
  ReactDOM 
} from "./modules/modules"
import { log, warn, error } from "./common/logger"
import storage from "./modules/storage"
import Patcher from "./modules/patcher"
import { push as pluginApiPush } from "./pluginapi"

// const { localStorage } = storage
// if (!localStorage.getItem("DrApi-Plugins")) localStorage.setItem("DrApi-Plugins", JSON.stringify([]))
// localStorage.getItem("DrApi-Plugins")?.forEach(e => DrApi.plugins[e[0].name] = e)
const { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches } = Patcher

window.DrApi = {
  modules: { findModule, findModuleByProps, findModuleByDisplayName, findAllModules },
  logger: { log, warn, error },
  info: {
    name: "Discord Re-envisioned",
    version: "1.0.0",
    shortName: "DrDiscord"
  },
  React, ReactDOM, storage,
  Patcher: { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches },
  plugins: {
    push: pluginApiPush
  },
}

log(DrApi.info.name, "Everything fully loaded")