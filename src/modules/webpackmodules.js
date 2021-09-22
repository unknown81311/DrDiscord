/**
 * @module WebpackModules
 * @version 0.0.1
 */
export default class WebpackModules {
    /**
     * getModule
     * @param {Function} filter A function to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @returns {Any}
     */
    getModule(filter = (m => m), first = true) {
        const webpackExports = (typeof window.webpackJsonp === "function") ?
            window.webpackJsonp([],{ "__extra_id__": (module, _export_, req) => { _export_.default = req } },[ "__extra_id__" ]).default :
            window.webpackJsonp.push( [[],{ "__extra_id__": (_module_, exports, req) => { _module_.exports = req } },[ [ "__extra_id__" ] ] ]) 
        for(let ite in webpackExports.c) {
            if(Object.hasOwnProperty.call(webpackExports.c, ite)) {
                let ele = webpackExports.c[ite].exports
                if(!ele) continue
                if(ele.__esModule && ele.default) ele = ele.default
                if(filter(ele)) return ele
            }
        }
        if (!first) {
            for (let ite of webpackExports.m) {
                try {
                    let modu = webpackExports(ite)
                    if(!modu) continue
                    if(modu.__esModule && m.default) modu = modu.default
                    if(filter(modu)) return modu
                }
                catch (e) { }
            }
        }
        return null
    }
    /**
     * Finds a single module using its own props
     * @param  {...string} props Props to use to filter modules
     * @returns {Any}
     */
    get getByProps() {
        return (...props) => this.getModule(module => props.every(prop => module[prop] !== undefined), true)
    }
    /**
     * Finds a single module using its own props
     * @param  {string} name The displayname for the react component
     * @returns {Any}
     */
    get getByDisplayName() {
        return (displayName) => this.getModule(module => {
            if (module.exports?.default?.displayName === displayName) return true
            return false
        }, true)
    }
    /**
     * Finds a single module using its own prototype
     * @param  {...string} prototypes Prototypes you want to filter modules
     * @returns {Any}
     */
    get getByPrototypes() {
        return (...prototypes) => {
            return this.getModule((module, filter = m => m) => {
                const component = filter(module)
                if (!component) return false
                if (!component.prototype) return false
                for (let f = 0; f < prototypes.length; f++) if (component.prototype[prototypes[f]] === undefined) return false
                return true
            }, true)
        }
    }
}