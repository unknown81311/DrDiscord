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
        for (const ite in webpackExports.c) {
            if (Object.hasOwnProperty.call(webpackExports.c, ite)) {
                let ele = webpackExports.c[ite]
                if(!ele) continue
                if(ele.__esModule && e.default) ele = ele.default
                if(filter(ele)) return (ele.exports.default === undefined) ? ele.exports : ele.exports.default
            }
        }
        if (!first) {
            for (const ite of webpackExports.m) {
                try {
                    let module = webpackExports(ite)
                    if(!module) continue
                    if(module.__esModule && module.default) module = module.default
                    if(filter(module)) return module
                }
                catch (e) {}
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
        return (...props) => this.getModule(module => {
            if (props?.every(prop => module?.exports[prop] === undefined)) return false
            return true
        }, true)
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
        })
    }
    /**
     * Finds a single module using its own prototype
     * @param  {...string} prototypes Prototypes you want to filter modules
     * @returns {Any}
     */
    get getByPrototypes() {
        return (...prototypes) => {
            const filterer = (fields, filter = m => m) => {
                return module => {
                    const component = filter(module.exports);
                    if (!component) return false;
                    if (!component.prototype) return false;
                    for (let f = 0; f < fields.length; f++) {
                        if (component.prototype[fields[f]] === undefined) return false;
                    }
                    return true;
                }
            }
            return this.getModule(filterer(prototypes), true)
        }
    }
    /**
     * Finds a single module using its id
     * @param  {string} number The id
     * @returns {Any}
     */
    get getById() {
        return (number) => this.getModule(module => {
            if (module.i === number) return true
            return false
        })
    }
}