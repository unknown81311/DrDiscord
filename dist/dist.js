(() => {
  // modules/modules.js
  function getAllModules() {
    const chunkers = ["webpackJsonp", "webpackChunkdiscord_app"];
    for (let chunky of chunkers) {
      const chunk = window[chunky];
      if (!chunk)
        continue;
      let modules;
      if (chunky == chunkers[0])
        modules = chunk.push([[], { "__extra_id__": (_module_, exports, req) => {
          _module_.exports = req;
        } }, [["__extra_id__"]]]);
      if (chunky == chunkers[1])
        chunk.push([[Math.random().toString(36).substring(7)], {}, (e) => modules = e]);
      return modules;
    }
  }
  function findAllModules(filter = (m) => m) {
    let modules = [];
    const webpackExports = getAllModules();
    for (let ite in webpackExports.c) {
      if (Object.hasOwnProperty.call(webpackExports.c, ite)) {
        let ele = webpackExports.c[ite].exports;
        if (!ele)
          continue;
        if (filter(ele))
          modules.push(ele);
      }
    }
    return modules;
  }
  function findModule(filter = (m) => m) {
    const modules = findAllModules();
    for (let ite in modules) {
      const module = modules[ite];
      if (filter(module))
        return module;
    }
    return void 0;
  }
  function findModuleByDisplayName(displayName) {
    const module = findModule((mod, filter = (e) => e) => {
      const component = filter(module);
      if (!component)
        return void 0;
      if (mod?.default?.displayName === displayName)
        return mod;
      return void 0;
    });
    if (!module?.default)
      return void 0;
    return module.default;
  }
  function findModuleByProps(...props) {
    const nonDefualt = findModule((module, filter = (e) => e) => {
      const component = filter(module);
      if (!component)
        return void 0;
      for (let p = 0; p < props.length; p++)
        if (component[props[p]] !== void 0)
          return module;
      return void 0;
    });
    const isDefualt = findModule((module, filter = (e) => e) => {
      const component = filter(module);
      if (!component)
        return void 0;
      if (!component.default)
        return void 0;
      for (let p = 0; p < props.length; p++) {
        if (!component.default[props[p]])
          return void 0;
        return module;
      }
      return void 0;
    });
    return nonDefualt !== void 0 ? nonDefualt : isDefualt?.default;
  }
  var React = findModuleByProps("createElement");
  var ReactDOM = findModuleByProps("render", "findDOMNode");

  // common/logger.js
  function logging({
    type = "log",
    title = DrApi.info.shortName,
    input = void 0
  }) {
    console[type](`%c[${title}]%c`, ["font-weight: bold", type === "log" && "color: red"].join(";"), "", typeof input === "object" ? [...input][0] : input);
  }
  function log(title, ...logs) {
    logging({
      type: "log",
      title,
      input: logs,
      color: "#001BEB"
    });
  }
  function warn(title, ...warns) {
    logging({
      type: "warn",
      title,
      input: warns,
      color: "#E3C710"
    });
  }
  function error(title, ...errors) {
    logging({
      type: "error",
      title,
      input: errors,
      color: "#DB1860"
    });
  }

  // modules/storage.js
  function localStorage() {
    if (!window.localstorage) {
      const frame = document.createElement("frame");
      frame.src = "about:blank";
      document.body.appendChild(frame);
      let r = Object.getOwnPropertyDescriptor(frame.contentWindow, "localStorage");
      frame.remove();
      Object.defineProperty(window, "localStorage", r);
      r = window.localStorage;
      delete window.localStorage;
      return r;
    }
    return window.localStorage;
  }
  function getData(pluginName, key, defaultValue) {
    const local = localStorage();
    let DrDiscordStorage = JSON.parse(local.getItem("DrDiscordStorage"));
    if (typeof DrDiscordStorage["PluginData"] == "undefined")
      DrDiscordStorage["PluginData"] = {};
    if (typeof DrDiscordStorage["PluginData"][pluginName] == "undefined")
      DrDiscordStorage["PluginData"][pluginName] = {};
    local.setItem("DrDiscordStorage", JSON.stringify(DrDiscordStorage));
    return DrDiscordStorage["PluginData"]?.[pluginName]?.[key] ?? defaultValue;
  }
  function setData(pluginName, key, value) {
    const local = localStorage();
    let DrDiscordStorage = JSON.parse(local.getItem("DrDiscordStorage"));
    if (typeof DrDiscordStorage["PluginData"] == "undefined")
      DrDiscordStorage["PluginData"] = {};
    if (typeof DrDiscordStorage["PluginData"][pluginName] == "undefined")
      DrDiscordStorage["PluginData"][pluginName] = {};
    DrDiscordStorage["PluginData"][pluginName][key] = value;
    local.setItem("DrDiscordStorage", JSON.stringify(DrDiscordStorage));
  }
  var storage_default = { localStorage: localStorage(), setData, getData };

  // modules/patcher.js
  var Patcher = class {
    static get patches() {
      return this._patches || (this._patches = []);
    }
    static getPatchesByCaller(name) {
      if (!name)
        return [];
      const patches2 = [];
      for (const patch of this.patches) {
        for (const childPatch of patch.children) {
          if (childPatch.caller === name)
            patches2.push(childPatch);
        }
      }
      return patches2;
    }
    static unpatchAll(patches2) {
      if (typeof patches2 === "string")
        patches2 = this.getPatchesByCaller(patches2);
      for (const patch of patches2)
        patch.unpatch();
    }
    static resolveModule(module) {
      if (!module || typeof module === "function" || typeof module === "object" && !Array.isArray(module))
        return module;
      if (Array.isArray(module))
        return findModuleByProps(module);
      return null;
    }
    static makeOverride(patch) {
      return function() {
        let returnValue;
        if (!patch.children || !patch.children.length)
          return patch.originalFunction.apply(this, arguments);
        for (const superPatch of patch.children.filter((c) => c.type === "before")) {
          try {
            superPatch.callback(this, arguments);
          } catch (err) {
            error("Patcher", `Could not fire before callback of ${patch.functionName} for ${superPatch.caller}`, err);
          }
        }
        const insteads = patch.children.filter((c) => c.type === "instead");
        if (!insteads.length) {
          returnValue = patch.originalFunction.apply(this, arguments);
        } else {
          for (const insteadPatch of insteads) {
            try {
              const tempReturn = insteadPatch.callback(this, arguments, patch.originalFunction.bind(this));
              if (typeof tempReturn !== "undefined")
                returnValue = tempReturn;
            } catch (err) {
              error("Patcher", `Could not fire instead callback of ${patch.functionName} for ${insteadPatch.caller}`, err);
            }
          }
        }
        for (const slavePatch of patch.children.filter((c) => c.type === "after")) {
          try {
            const tempReturn = slavePatch.callback(this, arguments, returnValue);
            if (typeof tempReturn !== "undefined")
              returnValue = tempReturn;
          } catch (err) {
            error("Patcher", `Could not fire after callback of ${patch.functionName} for ${slavePatch.caller}`, err);
          }
        }
        return returnValue;
      };
    }
    static rePatch(patch) {
      patch.proxyFunction = patch.module[patch.functionName] = this.makeOverride(patch);
    }
    static makePatch(module, functionName, name) {
      const patch = {
        name,
        module,
        functionName,
        originalFunction: module[functionName],
        proxyFunction: null,
        revert: () => {
          patch.module[patch.functionName] = patch.originalFunction;
          patch.proxyFunction = null;
          patch.children = [];
        },
        counter: 0,
        children: []
      };
      patch.proxyFunction = module[functionName] = this.makeOverride(patch);
      Object.assign(module[functionName], patch.originalFunction);
      module[functionName].__originalFunction = patch.originalFunction;
      module[functionName].toString = () => patch.originalFunction.toString();
      this.patches.push(patch);
      return patch;
    }
    static pushChildPatch(caller, moduleToPatch, functionName, callback, options = {}) {
      const {
        type = "after",
        forcePatch = true
      } = options;
      const module = this.resolveModule(moduleToPatch);
      if (!module)
        return null;
      if (!module[functionName] && forcePatch)
        module[functionName] = function() {
        };
      if (!(module[functionName] instanceof Function))
        return null;
      if (typeof moduleToPatch === "string")
        options.displayName = moduleToPatch;
      const displayName = options.displayName || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
      const patchId = `${displayName}.${functionName}`;
      const patch = this.patches.find((p) => p.module == module && p.functionName == functionName) || this.makePatch(module, functionName, patchId);
      if (!patch.proxyFunction)
        this.rePatch(patch);
      const child = {
        caller,
        type,
        id: patch.counter,
        callback,
        unpatch: () => {
          patch.children.splice(patch.children.findIndex((cpatch) => cpatch.id === child.id && cpatch.type === type), 1);
          if (patch.children.length <= 0) {
            const patchNum = this.patches.findIndex((p) => p.module == module && p.functionName == functionName);
            if (patchNum < 0)
              return;
            this.patches[patchNum].revert();
            this.patches.splice(patchNum, 1);
          }
        }
      };
      patch.children.push(child);
      patch.counter++;
      return child.unpatch;
    }
    static before(caller, moduleToPatch, functionName, callback, options = {}) {
      return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, { type: "before" }));
    }
    static after(caller, moduleToPatch, functionName, callback, options = {}) {
      return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, { type: "after" }));
    }
    static instead(caller, moduleToPatch, functionName, callback, options = {}) {
      return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, { type: "instead" }));
    }
  };

  // ui/modals.js
  async function showConfirmationModal(title, content, options = {}) {
    const Markdown = findModule((m) => m.displayName === "Markdown" && m.rules);
    const ConfirmModal = findModuleByDisplayName("ConfirmModal");
    const ModalActions = findModuleByProps("openModalLazy");
    const Buttons = findModuleByProps("ButtonColors");
    const { Messages } = findModuleByProps("Messages");
    if (!ModalActions || !ConfirmModal || !Markdown)
      return this.default(title, content);
    const emptyFunction = () => {
    };
    const { onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = "Messages.OKAY", cancelText = "Messages.CANCEL", danger = false, key = void 0 } = options;
    if (!Array.isArray(content))
      content = [content];
    content = content.map((c) => typeof c === "string" ? React.createElement(Markdown, null, c) : c);
    return ModalActions.openModal((props) => {
      return React.createElement(ConfirmModal, Object.assign({
        header: "title",
        confirmButtonColor: danger ? Buttons.ButtonColors.BRAND : Buttons.ButtonColors.BRAND,
        confirmText,
        cancelText,
        onConfirm,
        onCancel
      }, props), "content");
    }, { modalKey: key });
  }
  async function alert(title, children) {
    return showConfirmationModal(title, children, { cancelText: null });
  }

  // index.js
  var { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches } = Patcher;
  window.DrApi = {
    modules: { findModule, findModuleByProps, findModuleByDisplayName, findAllModules, getAllModules },
    logger: { log, warn, error },
    info: {
      name: "Discord Re-envisioned",
      version: "1.0.0",
      shortName: "DrDiscord"
    },
    React,
    ReactDOM,
    storage: storage_default,
    Patcher: { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches },
    modals: { showConfirmationModal, alert }
  };
  log(DrApi.info.shortName, "Everything fully loaded");
})();
