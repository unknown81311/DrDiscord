(() => {
  // src/util/logger.js
  "use strict";
  var Logger = class {
    logging({
      type = "log",
      title = DrApi.name,
      input = void 0,
      color = "red"
    }) {
      console[type](`%c[${title}]%c`, `font-weight: bold; color: ${color}`, "", typeof input === "object" ? [...input][0] : input);
    }
    get log() {
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

  // src/modules/webpackmodules.js
  "use strict";
  var WebpackModules = class {
    getModule(filter = (m) => m, first = true) {
      const webpackExports = typeof window.webpackJsonp === "function" ? window.webpackJsonp([], { "__extra_id__": (module, _export_, req) => {
        _export_.default = req;
      } }, ["__extra_id__"]).default : window.webpackJsonp.push([[], { "__extra_id__": (_module_, exports, req) => {
        _module_.exports = req;
      } }, [["__extra_id__"]]]);
      for (const ite in webpackExports.c) {
        if (Object.hasOwnProperty.call(webpackExports.c, ite)) {
          let ele = webpackExports.c[ite];
          if (!ele)
            continue;
          if (ele.__esModule && e.default)
            ele = ele.default;
          if (filter(ele))
            return ele.exports.default === void 0 ? ele.exports : ele.exports.default;
        }
      }
      if (!first) {
        for (const ite of webpackExports.m) {
          try {
            let module = webpackExports(ite);
            if (!module)
              continue;
            if (module.__esModule && module.default)
              module = module.default;
            if (filter(module))
              return module;
          } catch (e2) {
          }
        }
      }
      return null;
    }
    get getByProps() {
      return (...props) => this.getModule((module) => {
        if (props?.every((prop) => module?.exports[prop] === void 0))
          return false;
        return true;
      }, true);
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
        const filterer = (fields, filter = (m) => m) => {
          return (module) => {
            const component = filter(module.exports);
            if (!component)
              return false;
            if (!component.prototype)
              return false;
            for (let f = 0; f < fields.length; f++) {
              if (component.prototype[fields[f]] === void 0)
                return false;
            }
            return true;
          };
        };
        return this.getModule(filterer(prototypes), true);
      };
    }
    get getById() {
      return (number) => this.getModule((module) => {
        if (module.i === number)
          return true;
        return false;
      });
    }
  };

  // src/modules/discordmodules.js
  "use strict";
  var WebpackModules2 = new WebpackModules();
  var DiscordModules = class {
    get React() {
      return WebpackModules2.getByProps("createElement", "cloneElement");
    }
    get ReactDOM() {
      return WebpackModules2.getByProps("render", "findDOMNode");
    }
  };

  // src/index.js
  "use strict";
  window = typeof unsafeWindow === "undefined" ? window : unsafeWindow;
  var api = {
    Logger: new Logger(),
    WebpackModules: new WebpackModules(),
    DiscordModules: new DiscordModules(),
    localStorage: () => {
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
  };
  window.DrApi = {
    name: "Discord Re-envisioned",
    version: "0.0.1",
    Logger: api.Logger,
    WebpackModules: api.WebpackModules,
    DiscordModules: api.DiscordModules,
    localStorage: api.localStorage(),
    api
  };
  api.Logger.log(DrApi.name, "Has fully loaded");
})();
