function getAllModules() {
  function webpackExport() {
    if (typeof window.webpackChunkdiscord_app === 'undefined') {
      if (typeof window.webpackJsonp === "function") {
        return window.webpackJsonp([],
          {"__extra_id__": (module, _export_, req) => { _export_.default = req }}, 
          [ "__extra_id__"]
        ).default
      } 
      else {
        return window.webpackJsonp.push([[],
          {"__extra_id__": (_module_, exports, req) => { _module_.exports = req }}, 
          [["__extra_id__"]]
        ])
      }
    }
    else {
      // credit to creatable from Cumcord for being incredibly based and epic
      function getModules(chunkName) {
        randomId = Math.random().toString(36).substring(7);
      
        let modules = [];
      
        window[chunkName].push([
          [randomId],
          {},
          (e) => {
            for (let module in e.m) {
              modules.push(e([module]));
            }
          },
        ]);
        
        return modules;
      }
      return getModules("webpackChunkdiscord_app")
    }
  }
  return webpackExport()
}
/**
 * @name findAllModules
 * @param {function} filter 
 * @returns modules
 */
function findAllModules(filter = (m => m)) {
  if (window.webpackChunkdiscord_app === undefined) {
    let modules = []
    const webpackExports = getAllModules()
    for(let ite in webpackExports.c) {
      if(Object.hasOwnProperty.call(webpackExports.c, ite)) {
        let ele = webpackExports.c[ite].exports
        if(!ele) continue
        if(filter(ele)) modules.push(ele)
      }
    }
    return modules
  }
  return getAllModules()
}
/**
 * @name findModule
 * @param {function} filter 
 * @returns module
 */
function findModule(filter = (m => m)) {
  const modules = findAllModules()
  for(let ite in modules) {
    const module = modules[ite]
    if(filter(module)) return module
  }
  return undefined
}
/**
 * @name findModuleByDisplayName
 * @param {string} displayName 
 * @returns module
 */
function findModuleByDisplayName(displayName) {
  return findModule((module, filter = e => e) => {
    const component = filter(module)
    if (!component) return undefined
    if (module?.default?.displayName === displayName) return module
    return undefined
  }).default
}
/**
 * @name findModuleByProps
 * @param  {...strings} props 
 * @returns module
 */
function findModuleByProps(...props) {
  const nonDefualt = findModule((module, filter = e => e) => {
    const component = filter(module)
    if (!component) return undefined
    for (let p = 0; p < props.length; p++)
      if (component[props] !== undefined) return module
    return undefined
  })
  const isDefualt = findModule((module, filter = e => e) => {
    const component = filter(module)
    if (!component) return undefined
    if (component.default !== undefined)
      if (component.default[props] !== undefined) return module
    return undefined
  })

  return nonDefualt !== undefined ? nonDefualt : isDefualt?.default
}
/**
 * @name React
 * @description React stuff
 */
const React = findModuleByProps("createElement", "Fragment")
const ReactDOM = findModuleByProps("render", "findDOMNode")

export { findModule, findModuleByProps, findModuleByDisplayName, findAllModules, getAllModules, React, ReactDOM }