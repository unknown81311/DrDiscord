function getAllModules() {
  function webpackExport() {
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
  return webpackExport()
}

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

function findModule(filter = (m => m)) {
  const modules = findAllModules()
  for(let ite in modules) {
    const module = modules[ite]
    if(filter(module)) return module
  }
  return undefined
}

function findModuleByDisplayName(displayName) {
  return findModule((module, filter = e => e) => {
    const component = filter(module)
    if (!component) return undefined
    if (module?.default?.displayName === displayName) return module
    return undefined
  }).default
}

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

    if (component.default !== undefined)
      if (component.default[props] !== undefined) return module
      
    return undefined
  })

  return nonDefualt !== undefined ? nonDefualt : isDefualt.default
}

const React = findModuleByProps("createElement", "Fragment")
const ReactDOM = findModuleByProps("render", "findDOMNode")

export { findModule, findModuleByProps, findModuleByDisplayName, findAllModules, getAllModules, React, ReactDOM }