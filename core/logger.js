const { info } = require("../package.json")

function logging({
  type = "info", 
  title = info.name, 
  input = undefined
}) {
  console[type](`%c[${title}]%c`, ["font-weight: bold", type === "info" && "color: red"].join(";"), "", ...input)
}
/**
 * @name log
 * @param {string} title 
 * @param  {...any} logs 
 */
function log(title, ...logs) {
  logging({
    type: "info", 
    title: title, 
    input: logs
  })
}
/**
 * @name warn
 * @param {string} title 
 * @param  {...any} warns 
 */
function warn(title, ...warnings) {
  logging({
    type: "warn", 
    title: title, 
    input: warnings
  })
}
/**
 * @name error
 * @param {string} title 
 * @param  {...any} errors 
 */
function error(title, ...errors) {
  logging({
    type: "error", 
    title: title, 
    input: errors
  })
}
module.exports = { log, warn, error, logging }