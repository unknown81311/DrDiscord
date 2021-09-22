(() => {
  // src/util/logger.js
  var Logger = class {
    logging({
      type = "log",
      title = DrApi.name.full,
      input = void 0,
      color = "red"
    }) {
      console[type](`%c[${title}]%c`, `font-weight: bold; color: ${color}`, "", typeof input === "object" ? [...input][0] : input);
    }
    get log() {
      return (title, ...logs) => this.logging({
        type: "log",
        title,
        input: logs
      });
    }
    get warn() {
      return (title, ...warns) => this.logging({
        type: "warn",
        title,
        input: warns
      });
    }
    get error() {
      return (title, ...errors) => this.logging({
        type: "error",
        title,
        input: errors
      });
    }
  };

  // src/util/info.js
  var Info = class {
    get name() {
      return {
        full: "Discord Re-envisioned",
        short: "DrDiscord"
      };
    }
    get version() {
      return "1.0.0";
    }
  };

  // src/modules/webpackmodules.js
  var WebpackModules = class {
    getModule(filter = (m2) => m2, first = true) {
      const webpackExports = typeof window.webpackJsonp === "function" ? window.webpackJsonp([], { "__extra_id__": (module, _export_, req) => {
        _export_.default = req;
      } }, ["__extra_id__"]).default : window.webpackJsonp.push([[], { "__extra_id__": (_module_, exports, req) => {
        _module_.exports = req;
      } }, [["__extra_id__"]]]);
      for (let ite in webpackExports.c) {
        if (Object.hasOwnProperty.call(webpackExports.c, ite)) {
          let ele = webpackExports.c[ite].exports;
          if (!ele)
            continue;
          if (ele.__esModule && ele.default)
            ele = ele.default;
          if (filter(ele))
            return ele;
        }
      }
      if (!first) {
        for (let ite of webpackExports.m) {
          try {
            let modu = webpackExports(ite);
            if (!modu)
              continue;
            if (modu.__esModule && m.default)
              modu = modu.default;
            if (filter(modu))
              return modu;
          } catch (e) {
          }
        }
      }
      return null;
    }
    get getByProps() {
      return (...props) => this.getModule((module) => props.every((prop) => module[prop] !== void 0));
    }
    get getByDisplayName() {
      return (displayName) => this.getModule((module) => {
        if (module.exports?.default?.displayName === displayName)
          return true;
        return false;
      });
    }
    get getByPrototypes() {
      return (...prototypes) => {
        return this.getModule((module, filter = (m2) => m2) => {
          const component = filter(module);
          if (!component)
            return false;
          if (!component.prototype)
            return false;
          for (let f = 0; f < prototypes.length; f++)
            if (component.prototype[prototypes[f]] === void 0)
              return false;
          return true;
        }, true);
      };
    }
  };

  // src/modules/discordmodules.js
  var WebpackModules2 = new WebpackModules();
  var DiscordModules = class {
    get React() {
      return WebpackModules2.getByProps("createElement", "cloneElement");
    }
    get ReactDOM() {
      return WebpackModules2.getByProps("render", "findDOMNode");
    }
  };

  // src/modules/patcher.js
  var Patcher = class {
  };

  // src/index.js
  window = typeof unsafeWindow === "undefined" ? window : unsafeWindow;
  var api = {
    Logger: new Logger(),
    WebpackModules: new WebpackModules(),
    DiscordModules: new DiscordModules(),
    Patcher: new Patcher(),
    Info: new Info(),
    localStorage: () => {
      const frame = document.createElement("frame");
      frame.src = "about:blank";
      document.body.appendChild(frame);
      let r = Object.defineProperty(window, "localStorage", Object.getOwnPropertyDescriptor(frame.contentWindow, "localStorage"));
      frame.remove();
      r = window.localStorage;
      delete window.localStorage;
      return r;
    }
  };
  api.Logger.log(`${api.Info.name.short}-Api`, "Has fully loaded");
  window.DrApi = {
    info: api.Info,
    Logger: api.Logger,
    WebpackModules: api.WebpackModules,
    DiscordModules: api.DiscordModules,
    Patcher: api.Patcher,
    localStorage: api.localStorage()
  };
  api.Logger.log(`${api.Info.name.short}-${api.Info.version}`, "Has fully loaded");
})();
