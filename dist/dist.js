(() => {
  // modules/modules.js
  function getAllModules() {
    const chunkers = ["webpackChunkdiscord_app"];
    for (let chunky of chunkers) {
      const chunk = window[chunky];
      if (!chunk)
        continue;
      let modules;
      if (chunky == chunkers[0])
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
  function findModuleByDisplayName(displayName, first = true) {
    const modu = findAllModules((mod) => mod?.default?.displayName === displayName);
    if (first)
      return modu?.[0] ?? void 0;
    return modu ?? void 0;
  }
  function findModuleByProps(...props) {
    let isFirst = true;
    if (typeof props[props.length - 1] === "boolean")
      isFirst = props.pop();
    const nonDefault = findAllModules((mod) => {
      const filter = (e) => e;
      const component = filter(mod);
      if (!component)
        return void 0;
      for (let p = 0; p < props.length; p++) {
        if (!component[props[p]])
          return void 0;
        return mod;
      }
      return void 0;
    });
    const isDefault = findAllModules((mod) => {
      const filter = (e) => e;
      const component = filter(mod);
      if (!component)
        return void 0;
      if (!component.default)
        return void 0;
      for (let p = 0; p < props.length; p++) {
        if (!component.default[props[p]])
          return void 0;
        return mod;
      }
      return void 0;
    });
    let modules = [];
    if (nonDefault.length !== 0)
      for (const ite of nonDefault)
        modules.push(ite);
    if (isDefault.length !== 0)
      for (const ite of isDefault)
        modules.push(ite);
    if (isFirst && modules.length !== 0)
      return modules[0];
    if (modules.length !== 0)
      return modules;
    return void 0;
  }
  var React = findModuleByProps("createElement", "Fragment");
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
  function getData(pluginName, key, defaultValue = void 0) {
    if (!pluginName || !key)
      return error("getData", "You need atleast 2 args, 'pluginName', 'key'");
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
    if (!pluginName || !key || !value)
      return error("setData", "You need 3 args, 'pluginName', 'key', and 'value'");
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

  // pluginapi.js
  function push(plugin, pluginInfo) {
    if (!plugin)
      return error("PluginApi", "Plugin is required");
    if (!pluginInfo)
      return error("PluginApi", "Plugin info is required");
    if (typeof pluginInfo !== "object" || !pluginInfo.name || !pluginInfo.description || !pluginInfo.version || !pluginInfo.author) {
      error("PluginApi", "Plugin info is has to be a object/complete, demo below");
      log("demo", {
        name: "Plugin Name",
        description: "Plugin Description",
        version: "Plugin Version",
        author: "Plugin Author"
      });
      return;
    }
    DrApi.plugins[pluginInfo.name] = [plugin, pluginInfo];
    plugin?.onLoad?.();
    plugin?.prototype?.onLoad?.();
  }

  // index.js
  var { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches } = Patcher;
  window.DrApi = {
    modules: { findModule, findModuleByProps, findModuleByDisplayName, findAllModules },
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
    plugins: {
      push
    }
  };
  log(DrApi.info.name, "Everything fully loaded");
})();
