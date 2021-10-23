function logging({
  type = "log", 
  title = DrApi.info.shortName, 
  input = undefined
}) {
  console[type](`%c[${title}]%c`, ["font-weight: bold", type === "log" && "color: red"].join(";"), "", (typeof input === "object") ? [...input][0] : input)
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
    input: logs,
    color: "#001BEB"
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
    input: warns,
    color: "#E3C710"
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
    input: errors,
    color: "#DB1860"
  })
}

export { log, warn, error }