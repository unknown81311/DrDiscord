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
}

log(DrApi.info.name, "Everything fully loaded")