function getAllModules() {
  const chunkers = ["webpackChunkdiscord_app"]
  for (let chunky of chunkers) {
    const chunk = window[chunky]
    if (!chunk) continue
    let modules
    if(chunky == chunkers[0])
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
function findModuleByDisplayName(displayName, first = true) {
  const modu = findAllModules(mod => mod?.default?.displayName === displayName)
  if(first) return modu?.[0] ?? undefined
  return modu ?? undefined
}

/**
 * @name findModuleByProps
 * @param  {...strings} props 
 * @returns module
 */
function findModuleByProps(...props) { 
  let isFirst = true
  if (typeof props[props.length - 1] === "boolean") isFirst = props.pop()
  const nonDefault = findAllModules(mod => {
    const filter = (e) => e
    const component = filter(mod)
    if (!component) return undefined
    for (let p = 0; p < props.length; p++) {
      if (!component[props[p]]) return undefined
      return mod
    }
    return undefined
  })
  const isDefault = findAllModules(mod => {
    const filter = (e) => e
    const component = filter(mod)
    if (!component) return undefined
    if (!component.default) return undefined
    for (let p = 0; p < props.length; p++) {
      if (!component.default[props[p]]) return undefined
      return mod
    }
    return undefined
  })
  let modules = []
  if (nonDefault.length !== 0) for (const ite of nonDefault) modules.push(ite)
  if (isDefault.length !== 0) for (const ite of isDefault) modules.push(ite)
  if (isFirst && modules.length !== 0) return modules[0]
  if (modules.length !== 0) return modules
  return undefined
}

/**
 * @name React
 * @description React stuff
 */
const React = findModuleByProps("createElement", "Fragment")
const ReactDOM = findModuleByProps("render", "findDOMNode")

export { findModule, findModuleByProps, findModuleByDisplayName, findAllModules, getAllModules, React, ReactDOM }