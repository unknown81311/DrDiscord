let Patch_Symbol = Symbol("DrApi.patch")
let Quick_Symbol = Symbol("DrApi.patch.quick")
let Internal_Symbol = Symbol("DrDiscordInternal")
let ALLpatches = {}

function patch(patchName, moduleToPatch, functionToPatch, callback, patchType) {
  let originalFunction = moduleToPatch[functionToPatch]
  if (!originalFunction) {
    moduleToPatch[functionToPatch] = () => {}
    originalFunction = moduleToPatch[functionToPatch]
  }
  patchType = (patchType ?? "after").toLowerCase()
  if (!(patchType === "before" || patchType === "after" || patchType === "instead")) throw new Error(`'${patchType}' is a invalid patch type`)
  let patches = moduleToPatch?.[functionToPatch]?.[Patch_Symbol]?.patches ?? { before: [], after: [], instead: [] }
  let CallbackSymbol = Symbol()
  let patchInfo = { unpatch, patchName, moduleToPatch, functionToPatch, callback, patchType, Symbol: CallbackSymbol }
  patches[patchType].unshift(Object.assign(callback, { unpatch, Symbol: CallbackSymbol }))
  let DidUnpatch = false
  function unpatch() {
    if (DidUnpatch) return
    DidUnpatch = true
    let found = patches[patchType].find(p => p.Symbol === patchInfo.Symbol)
    let index = patches[patchType].indexOf(found)
    patches[patchType].splice(index, 1)
    found = ALLpatches[patchName].find(p => p.Symbol === patchInfo.Symbol)
    index = ALLpatches[patchName].indexOf(found)
    ALLpatches[patchName].splice(index, 1)
    if (!ALLpatches[patchName].length) delete ALLpatches[patchName]
  }
  if (!moduleToPatch[functionToPatch][Patch_Symbol]) {
    moduleToPatch[functionToPatch] = function() {
      for (const patch of patches.before) patch([...arguments], this)
      let insteadFunction = originalFunction
      for (const patch of patches.instead) insteadFunction = patch([...arguments], insteadFunction, this)
      let res = insteadFunction.apply(this, [...arguments])
      for (const patch of patches.after) patch([...arguments], res, this)
      return res
    }
    moduleToPatch[functionToPatch][Patch_Symbol] = {
      original: originalFunction,
      module: moduleToPatch,
      function: functionToPatch,
      patches, unpatchAll: () => {
        for (const patch of patches.before) patch.unpatch()
        for (const patch of patches.instead) patch.unpatch()
        for (const patch of patches.after) patch.unpatch()
        moduleToPatch[functionToPatch] = originalFunction
      }
    }
    let keys = Object.keys(originalFunction)
    for (const key of keys) moduleToPatch[functionToPatch][key] = originalFunction[key]
  }
  if (patchName.startsWith && patchName.startsWith("DrDiscordInternal")) {
    if (!ALLpatches[Internal_Symbol]) ALLpatches[Internal_Symbol] = [patchInfo]
    else ALLpatches[Internal_Symbol].push(patchInfo)
  }
  else {
    if (!ALLpatches[patchName]) ALLpatches[patchName] = [patchInfo]
    else ALLpatches[patchName].push(patchInfo)
  }
  return unpatch
}

Object.assign(patch, {
  before: (patchName, moduleToPatch, functionToPatch, callback) => patch(patchName, moduleToPatch, functionToPatch, callback, "before"),
  instead: (patchName, moduleToPatch, functionToPatch, callback) => patch(patchName, moduleToPatch, functionToPatch, callback, "instead"),
  after: (patchName, moduleToPatch, functionToPatch, callback) => patch(patchName, moduleToPatch, functionToPatch, callback, "after"),
  unpatchAll: function(name) {
    if (!ALLpatches[name]) return
    for (let i = ALLpatches[name].length; i > 0; i--) ALLpatches[name][i - 1].unpatch()
  },
  quick: (moduleToPatch, functionToPatch, callback, patchType) => patch(Quick_Symbol, moduleToPatch, functionToPatch, callback, patchType),
  patches: ALLpatches
})

module.exports = patch