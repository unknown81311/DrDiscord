interface Addon {
  disable: (name:string) => void
  enable: (name:string) => void
  folder: string 
  get: (name:string) => any
  getAll: () => any
  getByFileName: (name:string) => any
  getDisabled: (name:string) => any
  getEnabled: (name:string) => any
  isEnabled: (name:string) => boolean
  toggle: (name:string) => void
}

interface getModule {
  
}

interface Api {
  getModule: (filter:Array<string> | Function | number | string) => (any | null) | {
    all: (filter:Function) => (any | null)
    byName: (name:string) => (any | null)
    displayName: (name:string) => (any | null) | {
      type: (type:string) => (any | null)
      typeRender: (type:string) => (any | null)
    }
    getId: (module:object) => number
    props: (...props:Array<string>) => (any | null) | {
      all: (...props:Array<string>) => (any | null)
      default: (...props:Array<string>) => (any | null)
    }
    prototypes: (...prototypes:Array<string>) => (any | null) | {
      all: (...prototypes:Array<string>) => (any | null)
    }
    webpackExports: any
  }
  isDeveloper: Boolean
  localHostURL: string
  joinOfficialServer: () => void
  joinServer: (code:string, goTo:boolean) => void
  modal: {
    elements: {
      ModalCloseButton: any
      ModalContent: any
      ModalFooter: any
      ModalHeader: any
      ModalListContent: any
      ModalRoot: any
      ModalSize: any
      default: any
    }
    functions: {
      closeAllModals: () => void
      closeModal: (id:string) => void
      hasAnyModalOpen: () => boolean
      hasAnyModalOpenSelector: (id:any) => boolean
      hasModalOpen: (...args:any) => boolean
      hasModalOpenSelector: (id:string, ...args:any) => boolean
      openModal: (fun:Function, opts:Object, arg:any) => string
      openModalLazy: (...args:any) => string
      updateModal: (...args:any) => any
      useModalsStore: (...args:any) => any | {
        destroy: () => any
        getState: () => any
        setState: (...args:any) => any
        subscribe: (...args:any) => any
        update: (...args:any) => any
      }
    }
  }
  openSettings: (page:number, reactElement:any) => number
  patch: (name:string|Symbol, module:any, funcName:string, callback:Function, opts:Object) => Function | {
    after: (name:string|Symbol, module:any, funcName:string, callback:Function, opts:Object) => Function
    before: (name:string|Symbol, module:any, funcName:string, callback:Function, opts:Object) => Function
    instead: (name:string|Symbol, module:any, funcName:string, callback:Function, opts:Object) => Function
    patches: Array<any>
    quick: (module:any, funcName:string, callback:Function, opts:Object) => Function
    unpatchAll: (name:string|Symbol) => void
  }
  request: (...args:any) => any | any
  showConfirmationModal: (title:string, content?:Array<any>|any, options?:Object) => Number
  toggleCC: () => void
  updateDrDiscord: () => void
  util: {
    getOwnerInstance: (element:Node) => any
    getReactInstance: (element:Node) => any
    logger: {
      error: (title:string, ...errors:any) => any
      log: (title:string, ...errors:any) => any
      logging: (opts:any) => any
      warn: (title:string, ...errors:any) => any
    }
    sleep: (ms:number) => Promise<any>
    waitFor: (selector:string) => Promise<Node>
    waitUntil: (condition:any) => Promise<any>
  }
  styling: {
    addStyle: (name:string, css:string, sass:boolean) => Function
    remove: (name:string) => void
    compileSass: (css:string) => string
    update: (name:string, css:string, sass:boolean) => Function
  }
  DataStore: (name:string) => any | {
    deleteData: (name:string, key:string) => void
    getAllData: (name:string) => any
    getData: (name:string, key:string) => any
    setData: (name:string, key:string, value:any) => void
  }
  Plugins: Addon
  Themes: Addon
  customCSS: {
    get: () => {
      css:string,
      scss:string
    }
    update: (scss:string) => void
    openPopout: () => void
  }
  FluxDispatcher:any
  React: typeof import("react")
  ReactDOM: typeof import("react-dom")
} 

declare const DrApi: Api

interface window {
  DrApi: Api
  require: (module:string) => any | any
}