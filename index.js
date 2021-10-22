import { 
  findModule, 
  findModuleByProps, 
  findModuleByDisplayName, 
  findAllModules, 
  getAllModules, 
  React, 
  ReactDOM 
} from "./modules/modules"
import { 
  log, 
  warn, error 
} from "./common/logger"
import storage from "./modules/localstorage"
import Patcher from "./modules/patcher"
import { 
  showConfirmationModal, 
  alert 
} from "./ui/modals"

const { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches } = Patcher

window.DrApi = {
  modules: {findModule, findModuleByProps, findModuleByDisplayName, findAllModules, getAllModules},
  logger: { log, warn, error },
  info: {
    name: "Discord Re-envisioned",
    version: "1.0.0",
    shortName: "DrDiscord"
  },
  React, ReactDOM, storage,
  Patcher: { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches },
  modals: { showConfirmationModal, alert }
}

log(DrApi.info.shortName, "Everything fully loaded")