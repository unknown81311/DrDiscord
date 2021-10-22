(() => {
  // modules/modules.js
  function getAllModules() {
    function webpackExport() {
      if (typeof window.webpackChunkdiscord_app === "undefined") {
        if (typeof window.webpackJsonp === "function") {
          return window.webpackJsonp([], { "__extra_id__": (module, _export_, req) => {
            _export_.default = req;
          } }, ["__extra_id__"]).default;
        } else {
          return window.webpackJsonp.push([
            [],
            { "__extra_id__": (_module_, exports, req) => {
              _module_.exports = req;
            } },
            [["__extra_id__"]]
          ]);
        }
      } else
        window.alert(`Discord Re-envisioned is currently broken on canary`);
    }
    return webpackExport();
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
    return findModule((module, filter = (e) => e) => {
      const component = filter(module);
      if (!component)
        return void 0;
      if (module?.default?.displayName === displayName)
        return module;
      return void 0;
    }).default;
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
      if (component.default !== void 0) {
        if (component.default[props] !== void 0)
          return module;
      }
      return void 0;
    });
    return nonDefualt !== void 0 ? nonDefualt : isDefualt.default;
  }
  var React = findModuleByProps("createElement", "Fragment");
  var ReactDOM = findModuleByProps("render", "findDOMNode");

  // common/logger.js
  function logging({
    type = "log",
    title = DrApi.info.shortName,
    input = void 0,
    color = "red"
  }) {
    console[type](`%c[${title}]%c`, `font-weight: bold; color: ${color}`, "", typeof input === "object" ? [...input][0] : input);
  }
  function log2(title, ...logs) {
    logging({
      type: "log",
      title,
      input: logs
    });
  }
  function warn(title, ...warns) {
    logging({
      type: "warn",
      title,
      input: warns
    });
  }
  function error(title, ...errors) {
    logging({
      type: "error",
      title,
      input: errors
    });
  }

  // modules/localstorage.js
  function localStorage() {
    if (window.localStorage === void 0) {
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
  var storage = {
    localStorage: localStorage(),
    setData,
    getData
  };
  var localstorage_default = storage;

  // modules/discordmodules.js
  var memoizeObject = (object) => {
    const proxy = new Proxy(object, {
      get: function(obj, mod) {
        if (!obj.hasOwnProperty(mod))
          return void 0;
        if (Object.getOwnPropertyDescriptor(obj, mod).get) {
          const value = obj[mod];
          delete obj[mod];
          obj[mod] = value;
        }
        return obj[mod];
      },
      set: function(obj, mod, value) {
        if (obj.hasOwnProperty(mod))
          return log.error("MemoizedObject", "Trying to overwrite existing property");
        obj[mod] = value;
        return obj[mod];
      }
    });
    Object.defineProperty(proxy, "hasOwnProperty", { value: function(prop) {
      return this[prop] !== void 0;
    } });
    return proxy;
  };
  var discordmodules_default = memoizeObject({
    get React() {
      return DrApi.findModuleByProps("createElement", "cloneElement");
    },
    get ReactDOM() {
      return DrApi.findModuleByProps("render", "findDOMNode");
    },
    get Flux() {
      return DrApi.findModuleByProps("connectStores");
    },
    get Events() {
      return DrApi.findModuleByPrototypes("setMaxListeners", "emit");
    },
    get GuildStore() {
      return DrApi.findModuleByProps("getGuild");
    },
    get SortedGuildStore() {
      return DrApi.findModuleByProps("getSortedGuilds");
    },
    get SelectedGuildStore() {
      return DrApi.findModuleByProps("getLastSelectedGuildId");
    },
    get GuildSync() {
      return DrApi.findModuleByProps("getSyncedGuilds");
    },
    get GuildInfo() {
      return DrApi.findModuleByProps("getAcronym");
    },
    get GuildChannelsStore() {
      return DrApi.findModuleByProps("getChannels", "getDefaultChannel");
    },
    get GuildMemberStore() {
      return DrApi.findModuleByProps("getMember");
    },
    get MemberCountStore() {
      return DrApi.findModuleByProps("getMemberCounts");
    },
    get GuildEmojiStore() {
      return DrApi.findModuleByProps("getEmojis");
    },
    get GuildActions() {
      return DrApi.findModuleByProps("markGuildAsRead");
    },
    get GuildPermissions() {
      return DrApi.findModuleByProps("getGuildPermissions");
    },
    get ChannelStore() {
      return DrApi.findModuleByProps("getChannel", "getDMFromUserId");
    },
    get SelectedChannelStore() {
      return DrApi.findModuleByProps("getLastSelectedChannelId");
    },
    get ChannelActions() {
      return DrApi.findModuleByProps("selectChannel");
    },
    get PrivateChannelActions() {
      return DrApi.findModuleByProps("openPrivateChannel");
    },
    get ChannelSelector() {
      return DrApi.findModuleByProps("selectGuild", "selectChannel");
    },
    get UserInfoStore() {
      return DrApi.findModuleByProps("getToken");
    },
    get UserSettingsStore() {
      return DrApi.findModuleByProps("guildPositions");
    },
    get AccountManager() {
      return DrApi.findModuleByProps("register", "login");
    },
    get UserSettingsUpdater() {
      return DrApi.findModuleByProps("updateRemoteSettings");
    },
    get OnlineWatcher() {
      return DrApi.findModuleByProps("isOnline");
    },
    get CurrentUserIdle() {
      return DrApi.findModuleByProps("getIdleTime");
    },
    get RelationshipStore() {
      return DrApi.findModuleByProps("isBlocked", "getFriendIDs");
    },
    get RelationshipManager() {
      return DrApi.findModuleByProps("addRelationship");
    },
    get MentionStore() {
      return DrApi.findModuleByProps("getMentions");
    },
    get UserStore() {
      return DrApi.findModuleByProps("getCurrentUser");
    },
    get UserStatusStore() {
      return DrApi.findModuleByProps("getStatus", "getState");
    },
    get UserTypingStore() {
      return DrApi.findModuleByProps("isTyping");
    },
    get UserActivityStore() {
      return DrApi.findModuleByProps("getActivity");
    },
    get UserNameResolver() {
      return DrApi.findModuleByProps("getName");
    },
    get UserNoteStore() {
      return DrApi.findModuleByProps("getNote");
    },
    get UserNoteActions() {
      return DrApi.findModuleByProps("updateNote");
    },
    get EmojiInfo() {
      return DrApi.findModuleByProps("isEmojiDisabled");
    },
    get EmojiUtils() {
      return DrApi.findModuleByProps("getGuildEmoji");
    },
    get EmojiStore() {
      return DrApi.findModuleByProps("getByCategory", "EMOJI_NAME_RE");
    },
    get InviteStore() {
      return DrApi.findModuleByProps("getInvites");
    },
    get InviteResolver() {
      return DrApi.findModuleByProps("findInvite");
    },
    get InviteActions() {
      return DrApi.findModuleByProps("acceptInvite");
    },
    get DiscordConstants() {
      return DrApi.findModuleByProps("Permissions", "ActivityTypes", "StatusTypes");
    },
    get DiscordPermissions() {
      return DrApi.findModuleByProps("Permissions", "ActivityTypes", "StatusTypes").Permissions;
    },
    get PermissionUtils() {
      return DrApi.findModuleByProps("getHighestRole");
    },
    get ColorConverter() {
      return DrApi.findModuleByProps("hex2int");
    },
    get ColorShader() {
      return DrApi.findModuleByProps("darken");
    },
    get TinyColor() {
      return DrApi.findModuleByPrototypes("toRgb");
    },
    get ClassResolver() {
      return DrApi.findModuleByProps("getClass");
    },
    get ButtonData() {
      return DrApi.findModuleByProps("ButtonSizes");
    },
    get IconNames() {
      return DrApi.findModuleByProps("IconNames");
    },
    get NavigationUtils() {
      return DrApi.findModuleByProps("transitionTo", "replaceWith", "getHistory");
    },
    get MessageStore() {
      return DrApi.findModuleByProps("getMessages");
    },
    get MessageActions() {
      return DrApi.findModuleByProps("jumpToMessage", "_sendMessage");
    },
    get MessageQueue() {
      return DrApi.findModuleByProps("enqueue");
    },
    get MessageParser() {
      return DrApi.findModuleByProps("createMessage", "parse", "unparse");
    },
    get hljs() {
      return DrApi.findModuleByProps("highlight", "highlightBlock");
    },
    get SimpleMarkdown() {
      return DrApi.findModuleByProps("parseBlock", "parseInline", "defaultOutput");
    },
    get ExperimentStore() {
      return DrApi.findModuleByProps("getExperimentOverrides");
    },
    get ExperimentsManager() {
      return DrApi.findModuleByProps("isDeveloper");
    },
    get CurrentExperiment() {
      return DrApi.findModuleByProps("getExperimentId");
    },
    get ImageResolver() {
      return DrApi.findModuleByProps("getUserAvatarURL", "getGuildIconURL");
    },
    get ImageUtils() {
      return DrApi.findModuleByProps("getSizedImageSrc");
    },
    get AvatarDefaults() {
      return DrApi.findModuleByProps("getUserAvatarURL", "DEFAULT_AVATARS");
    },
    get WindowInfo() {
      return DrApi.findModuleByProps("isFocused", "windowSize");
    },
    get TagInfo() {
      return DrApi.findModuleByProps("VALID_TAG_NAMES");
    },
    get DOMInfo() {
      return DrApi.findModuleByProps("canUseDOM");
    },
    get LocaleManager() {
      return DrApi.findModuleByProps("setLocale");
    },
    get Moment() {
      return DrApi.findModuleByProps("parseZone");
    },
    get LocationManager() {
      return DrApi.findModuleByProps("createLocation");
    },
    get Timestamps() {
      return DrApi.findModuleByProps("fromTimestamp");
    },
    get TimeFormatter() {
      return DrApi.findModuleByProps("dateFormat");
    },
    get Strings() {
      return DrApi.findModuleByProps("Messages").Messages;
    },
    get StringFormats() {
      return DrApi.findModuleByProps("a", "z");
    },
    get StringUtils() {
      return DrApi.findModuleByProps("toASCII");
    },
    get URLParser() {
      return DrApi.findModuleByProps("Url", "parse");
    },
    get ExtraURLs() {
      return DrApi.findModuleByProps("getArticleURL");
    },
    get DNDActions() {
      return DrApi.findModuleByProps("beginDrag");
    },
    get DNDSources() {
      return DrApi.findModuleByProps("addTarget");
    },
    get DNDObjects() {
      return DrApi.findModuleByProps("DragSource");
    },
    get MediaDeviceInfo() {
      return DrApi.findModuleByProps("Codecs", "SUPPORTED_BROWSERS");
    },
    get MediaInfo() {
      return DrApi.findModuleByProps("getOutputVolume");
    },
    get MediaEngineInfo() {
      return DrApi.findModuleByProps("MediaEngineFeatures");
    },
    get VoiceInfo() {
      return DrApi.findModuleByProps("EchoCancellation");
    },
    get VideoStream() {
      return DrApi.findModuleByProps("getVideoStream");
    },
    get SoundModule() {
      return DrApi.findModuleByProps("playSound");
    },
    get ElectronModule() {
      return DrApi.findModuleByProps("setBadge");
    },
    get Dispatcher() {
      return DrApi.findModuleByProps("dirtyDispatch");
    },
    get PathUtils() {
      return DrApi.findModuleByProps("hasBasename");
    },
    get NotificationModule() {
      return DrApi.findModuleByProps("showNotification");
    },
    get RouterModule() {
      return DrApi.findModuleByProps("Router");
    },
    get APIModule() {
      return DrApi.findModuleByProps("getAPIBaseURL");
    },
    get AnalyticEvents() {
      return DrApi.findModuleByProps("AnalyticEventConfigs");
    },
    get Buffers() {
      return DrApi.findModuleByProps("Buffer", "kMaxLength");
    },
    get DeviceStore() {
      return DrApi.findModuleByProps("getDevices");
    },
    get SoftwareInfo() {
      return DrApi.findModuleByProps("os");
    },
    get CurrentContext() {
      return DrApi.findModuleByProps("setTagsContext");
    },
    get GuildClasses() {
      const guildsWrapper = DrApi.findModuleByProps("wrapper", "unreadMentionsBar");
      const guilds = DrApi.findModuleByProps("guildsError", "selected");
      const pill = DrApi.findModuleByProps("blobContainer");
      return Object.assign({}, guildsWrapper, guilds, pill);
    },
    get LayerStack() {
      return DrApi.findModuleByProps("pushLayer");
    }
  });

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
      if (typeof module === "string")
        return discordmodules_default[module];
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
    const Markdown = findModuleByDisplayName("Markdown");
    const ConfirmationModal = findModuleByDisplayName("ConfirmModal");
    const ModalActions = findModuleByProps("openModal");
    const Buttons = findModuleByProps("ButtonColors");
    const { Messages } = findModuleByProps("Messages");
    if (!ModalActions || !ConfirmationModal || !Markdown)
      return this.default(title, content);
    const emptyFunction = () => {
    };
    const { onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = Messages.OKAY, cancelText = Messages.CANCEL, danger = false, key = void 0 } = options;
    if (!Array.isArray(content))
      content = [content];
    content = content.map((c) => typeof c === "string" ? React.createElement(Markdown, null, c) : c);
    return ModalActions.openModal((props) => {
      return React.createElement(ConfirmationModal, Object.assign({
        header: title,
        confirmButtonColor: danger ? Buttons.ButtonColors.RED : Buttons.ButtonColors.BRAND,
        confirmText,
        cancelText,
        onConfirm,
        onCancel
      }, props), content);
    }, { modalKey: key });
  }
  async function alert(title, children) {
    return showConfirmationModal(title, children, { cancelText: null });
  }

  // index.js
  var { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches } = Patcher;
  window.DrApi = {
    modules: { findModule, findModuleByProps, findModuleByDisplayName, findAllModules, getAllModules },
    logger: { log: log2, warn, error },
    info: {
      name: "Discord Re-envisioned",
      version: "1.0.0",
      shortName: "DrDiscord"
    },
    React,
    ReactDOM,
    storage: localstorage_default,
    Patcher: { after, before, getPatchesByCaller, instead, pushChildPatch, unpatchAll, patches },
    modals: { showConfirmationModal, alert }
  };
  log2(DrApi.info.shortName, "Everything fully loaded");
})();
