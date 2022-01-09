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

interface Api {
  find: (filter:Array<string> | Function) => any | {
    all: (filter:Function) => any
    byName: (name:string) => any
    displayName: (name:string) => any | {
      type: (type:string) => any
      typeRender: (type:string) => any
    }
    getId: (module:object) => number
    id: (id:number) => any
    props: (props:Array<string>) => any | {
      all: (props:Array<string>) => any
      default: (props:Array<string>) => any
    }
    prototypes: (prototypes:Array<string>) => any | {
      all: (prototypes:Array<string>) => any
    }
    webpackExports: any
    isDeveloper: Boolean
  }
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
  patch: (name:string, module:any, funcName:string, callback:Function, opts:Object) => Function | {
    after: (name:string, module:any, funcName:string, callback:Function, opts:Object) => Function
    before: (name:string, module:any, funcName:string, callback:Function, opts:Object) => Function
    instead: (name:string, module:any, funcName:string, callback:Function, opts:Object) => Function
    patches: Array<any>
    quick: (module:any, funcName:string, callback:Function, opts:Object) => Function
    unpatchAll: (name:string) => void
  }
  request: (...args:any) => any | any
  showConfirmationModal: (title:string, content:Array<any>|any, options:Object) => Number
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
  React: {
    createElement: (type:string, props:any, ...children:any[]) => any
    createFactory: (type:string) => any
    createRef: () => any
    Fragment: any
    PureComponent: any
    StrictMode: any
    cloneElement: (element:any, props:any, ...children:any[]) => any
    createContext: (defaultValue:any) => any
    forwardRef: (render:any) => any
    isValidElement: (element:any) => boolean
    lazy: (fn:() => any) => any
    memo: (type:any, compare?:any) => any
    useCallback: (callback:any, deps:any[]) => any
    useContext: (context:any, observedBits:any) => any
    useDebugValue: (value:any, formatterFn:any) => void
    useEffect: (effect:any, deps:any[]) => void
    useImperativeHandle: (ref:any, create:any, deps:any[]) => void
    useLayoutEffect: (effect:any, deps:any[]) => void
    useMemo: (callback:any, deps:any[]) => any
    useReducer: (reducer:any, initialState:any, init:any) => any
    useRef: (initialValue:any) => any
    useState: (initialState:any) => any
    version: string
  }
  ReactDOM: {
    createPortal: (children:any, container:any) => any
    findDOMNode: (component:any) => any
    flushSync: (callback:any) => void
    hydrate: (element:any, container:any, callback:any) => void
    render: (element:any, container:any, callback:any) => void
    unmountComponentAtNode: (container:any) => void
    version: string
  }
} 

declare const DrApi: Api

interface window {
  DrApi: Api
  require: (module:string) => any | any
}