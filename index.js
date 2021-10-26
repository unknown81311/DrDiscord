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

window.DrApi = {
  modules: { findModule, findModuleByProps, findModuleByDisplayName, findAllModules },
  logger: { log, warn, error },
  info: {
    name: "Discord Re-envisioned",
    version: "1.0.0",
    shortName: "DrDiscord"
  },
  React, ReactDOM, storage,
  Patcher,
}

log(DrApi.info.name, "Everything fully loaded")