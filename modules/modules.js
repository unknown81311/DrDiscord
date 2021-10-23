function getAllModules() {
  const chunkers = ["webpackJsonp", "webpackChunkdiscord_app"]
  for (let chunky of chunkers) {
    const chunk = window[chunky]
    if (!chunk) continue
    let modules
    if(chunky == chunkers[0])
      modules = chunk.push([[],{"__extra_id__": (_module_, exports, req) => { _module_.exports = req }}, [["__extra_id__"]]]) 
    if(chunky == chunkers[1])
      chunk.push([[Math.random().toString(36).substring(7)],{},(e) => modules = e]) 
    return modules
  }
}
/**
 * @name findAllModules
 * @param {function} filter 
 * @returns modules
 */
function findAllModules(filter = (m => m)) {
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
  const module = findModule((mod, filter = e => e) => {
    const component = filter(module)
    if (!component) return undefined
    if (mod?.default?.displayName === displayName) return mod
    return undefined
  })
  if (!module?.default) return undefined
  return module.default
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
      if (component[props[p]] !== undefined) return module
    return undefined
  })
  const isDefualt = findModule((module, filter = e => e) => {
    const component = filter(module)
    if (!component) return undefined
    if (!component.default) return undefined
    for (let p = 0; p < props.length; p++) {
      if (!component.default[props[p]]) return undefined
      return module
    }
    return undefined
  })
  return nonDefualt !== undefined ? nonDefualt : isDefualt?.default
}
/**
 * @name React
 * @description React stuff
 */
const React = findModuleByProps("createElement")
const ReactDOM = findModuleByProps("render", "findDOMNode")

export { findModule, findModuleByProps, findModuleByDisplayName, findAllModules, React, ReactDOM }
