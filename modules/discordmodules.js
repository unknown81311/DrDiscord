function memoizeObject(object) {
  const proxy = new Proxy(object, {
    get: function (obj, mod) {
      if (!obj.hasOwnProperty(mod))
        return undefined
      if (Object.getOwnPropertyDescriptor(obj, mod).get) {
        const value = obj[mod]
        delete obj[mod]
        obj[mod] = value
      }
      return obj[mod]
    },
    set: function (obj, mod, value) {
      if (obj.hasOwnProperty(mod))
        return log.error("MemoizedObject", "Trying to overwrite existing property")
      obj[mod] = value
      return obj[mod]
    }
  })
  Object.defineProperty(proxy, "hasOwnProperty", {
    value: function (prop) {
      return this[prop] !== undefined
    }
  })
  return proxy
}
export default memoizeObject({
  get React() {return DrApi.findModuleByProps("createElement", "cloneElement")},
  get ReactDOM() {return DrApi.findModuleByProps("render", "findDOMNode")},
  get Flux() {return DrApi.findModuleByProps("connectStores")},
  get Events() {return DrApi.findModuleByPrototypes("setMaxListeners", "emit")},

  /* Guild Info, Stores, and Utilities */
  get GuildStore() {return DrApi.findModuleByProps("getGuild")},
  get SortedGuildStore() {return DrApi.findModuleByProps("getSortedGuilds")},
  get SelectedGuildStore() {return DrApi.findModuleByProps("getLastSelectedGuildId")},
  get GuildSync() {return DrApi.findModuleByProps("getSyncedGuilds")},
  get GuildInfo() {return DrApi.findModuleByProps("getAcronym")},
  get GuildChannelsStore() {return DrApi.findModuleByProps("getChannels", "getDefaultChannel")},
  get GuildMemberStore() {return DrApi.findModuleByProps("getMember")},
  get MemberCountStore() {return DrApi.findModuleByProps("getMemberCounts")},
  get GuildEmojiStore() {return DrApi.findModuleByProps("getEmojis")},
  get GuildActions() {return DrApi.findModuleByProps("markGuildAsRead")},
  get GuildPermissions() {return DrApi.findModuleByProps("getGuildPermissions")},

  /* Channel Store & Actions */
  get ChannelStore() {return DrApi.findModuleByProps("getChannel", "getDMFromUserId")},
  get SelectedChannelStore() {return DrApi.findModuleByProps("getLastSelectedChannelId")},
  get ChannelActions() {return DrApi.findModuleByProps("selectChannel")},
  get PrivateChannelActions() {return DrApi.findModuleByProps("openPrivateChannel")},
  get ChannelSelector() {return DrApi.findModuleByProps("selectGuild", "selectChannel")},

  /* Current User Info, State and Settings */
  get UserInfoStore() {return DrApi.findModuleByProps("getToken")},
  get UserSettingsStore() {return DrApi.findModuleByProps("guildPositions")},
  get AccountManager() {return DrApi.findModuleByProps("register", "login")},
  get UserSettingsUpdater() {return DrApi.findModuleByProps("updateRemoteSettings")},
  get OnlineWatcher() {return DrApi.findModuleByProps("isOnline")},
  get CurrentUserIdle() {return DrApi.findModuleByProps("getIdleTime")},
  get RelationshipStore() {return DrApi.findModuleByProps("isBlocked", "getFriendIDs")},
  get RelationshipManager() {return DrApi.findModuleByProps("addRelationship")},
  get MentionStore() {return DrApi.findModuleByProps("getMentions")},

  /* User Stores and Utils */
  get UserStore() {return DrApi.findModuleByProps("getCurrentUser")},
  get UserStatusStore() {return DrApi.findModuleByProps("getStatus", "getState")},
  get UserTypingStore() {return DrApi.findModuleByProps("isTyping")},
  get UserActivityStore() {return DrApi.findModuleByProps("getActivity")},
  get UserNameResolver() {return DrApi.findModuleByProps("getName")},
  get UserNoteStore() {return DrApi.findModuleByProps("getNote")},
  get UserNoteActions() {return DrApi.findModuleByProps("updateNote")},

  /* Emoji Store and Utils */
  get EmojiInfo() {return DrApi.findModuleByProps("isEmojiDisabled")},
  get EmojiUtils() {return DrApi.findModuleByProps("getGuildEmoji")},
  get EmojiStore() {return DrApi.findModuleByProps("getByCategory", "EMOJI_NAME_RE")},

  /* Invite Store and Utils */
  get InviteStore() {return DrApi.findModuleByProps("getInvites")},
  get InviteResolver() {return DrApi.findModuleByProps("findInvite")},
  get InviteActions() {return DrApi.findModuleByProps("acceptInvite")},

  /* Discord Objects & Utils */
  get DiscordConstants() {return DrApi.findModuleByProps("Permissions", "ActivityTypes", "StatusTypes")},
  get DiscordPermissions() {return DrApi.findModuleByProps("Permissions", "ActivityTypes", "StatusTypes").Permissions},
  get PermissionUtils() {return DrApi.findModuleByProps("getHighestRole")},
  get ColorConverter() {return DrApi.findModuleByProps("hex2int")},
  get ColorShader() {return DrApi.findModuleByProps("darken")},
  get TinyColor() {return DrApi.findModuleByPrototypes("toRgb")},
  get ClassResolver() {return DrApi.findModuleByProps("getClass")},
  get ButtonData() {return DrApi.findModuleByProps("ButtonSizes")},
  get IconNames() {return DrApi.findModuleByProps("IconNames")},
  get NavigationUtils() {return DrApi.findModuleByProps("transitionTo", "replaceWith", "getHistory")},

  /* Discord Messages */
  get MessageStore() {return DrApi.findModuleByProps("getMessages")},
  get MessageActions() {return DrApi.findModuleByProps("jumpToMessage", "_sendMessage")},
  get MessageQueue() {return DrApi.findModuleByProps("enqueue")},
  get MessageParser() {return DrApi.findModuleByProps("createMessage", "parse", "unparse")},

  /* Text Processing */
  get hljs() {return DrApi.findModuleByProps("highlight", "highlightBlock")},
  get SimpleMarkdown() {return DrApi.findModuleByProps("parseBlock", "parseInline", "defaultOutput")},

  /* Experiments */
  get ExperimentStore() {return DrApi.findModuleByProps("getExperimentOverrides")},
  get ExperimentsManager() {return DrApi.findModuleByProps("isDeveloper")},
  get CurrentExperiment() {return DrApi.findModuleByProps("getExperimentId")},

  /* Images, Avatars and Utils */
  get ImageResolver() {return DrApi.findModuleByProps("getUserAvatarURL", "getGuildIconURL")},
  get ImageUtils() {return DrApi.findModuleByProps("getSizedImageSrc")},
  get AvatarDefaults() {return DrApi.findModuleByProps("getUserAvatarURL", "DEFAULT_AVATARS")},

  /* Window, DOM, HTML */
  get WindowInfo() {return DrApi.findModuleByProps("isFocused", "windowSize")},
  get TagInfo() {return DrApi.findModuleByProps("VALID_TAG_NAMES")},
  get DOMInfo() {return DrApi.findModuleByProps("canUseDOM")},

  /* Locale/Location and Time */
  get LocaleManager() {return DrApi.findModuleByProps("setLocale")},
  get Moment() {return DrApi.findModuleByProps("parseZone")},
  get LocationManager() {return DrApi.findModuleByProps("createLocation")},
  get Timestamps() {return DrApi.findModuleByProps("fromTimestamp")},
  get TimeFormatter() {return DrApi.findModuleByProps("dateFormat")},

  /* Strings and Utils */
  get Strings() {return DrApi.findModuleByProps("Messages").Messages},
  get StringFormats() {return DrApi.findModuleByProps("a", "z")},
  get StringUtils() {return DrApi.findModuleByProps("toASCII")},

  /* URLs and Utils */
  get URLParser() {return DrApi.findModuleByProps("Url", "parse")},
  get ExtraURLs() {return DrApi.findModuleByProps("getArticleURL")},

  /* Drag & Drop */
  get DNDActions() {return DrApi.findModuleByProps("beginDrag")},
  get DNDSources() {return DrApi.findModuleByProps("addTarget")},
  get DNDObjects() {return DrApi.findModuleByProps("DragSource")},

  /* Media Stuff (Audio/Video) */
  get MediaDeviceInfo() {return DrApi.findModuleByProps("Codecs", "SUPPORTED_BROWSERS")},
  get MediaInfo() {return DrApi.findModuleByProps("getOutputVolume")},
  get MediaEngineInfo() {return DrApi.findModuleByProps("MediaEngineFeatures")},
  get VoiceInfo() {return DrApi.findModuleByProps("EchoCancellation")},
  get VideoStream() {return DrApi.findModuleByProps("getVideoStream")},
  get SoundModule() {return DrApi.findModuleByProps("playSound")},

  /* Electron & Other Internals with Utils*/
  get ElectronModule() {return DrApi.findModuleByProps("setBadge")},
  get Dispatcher() {return DrApi.findModuleByProps("dirtyDispatch")},
  get PathUtils() {return DrApi.findModuleByProps("hasBasename")},
  get NotificationModule() {return DrApi.findModuleByProps("showNotification")},
  get RouterModule() {return DrApi.findModuleByProps("Router")},
  get APIModule() {return DrApi.findModuleByProps("getAPIBaseURL")},
  get AnalyticEvents() {return DrApi.findModuleByProps("AnalyticEventConfigs")},
  get Buffers() {return DrApi.findModuleByProps("Buffer", "kMaxLength")},
  get DeviceStore() {return DrApi.findModuleByProps("getDevices")},
  get SoftwareInfo() {return DrApi.findModuleByProps("os")},
  get CurrentContext() {return DrApi.findModuleByProps("setTagsContext")},

  /* Commonly Used Classes */
  get GuildClasses() {
      const guildsWrapper = DrApi.findModuleByProps("wrapper", "unreadMentionsBar")
      const guilds = DrApi.findModuleByProps("guildsError", "selected")
      const pill = DrApi.findModuleByProps("blobContainer")
      return Object.assign({}, guildsWrapper, guilds, pill)
  },

  get LayerStack() {return DrApi.findModuleByProps("pushLayer")}
})