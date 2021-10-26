function logging({
  type = "log", 
  title = DrApi.info.shortName, 
  input = undefined
}) {
  console[type](`%c[${title}]%c`, ["font-weight: bold", type === "log" && "color: red"].join(";"), "", ...input)
}
/**
 * @name log
 * @param {string} title 
 * @param  {...any} logs 
 */
function log(title, ...logs) {
  logging({
    type: "log", 
    title: title, 
    input: logs
  })
}
/**
 * @name warn
 * @param {string} title 
 * @param  {...any} warns 
 */
function warn(title, ...warns) {
  logging({
    type: "warn", 
    title: title, 
    input: warns
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

export { log, warn, error }