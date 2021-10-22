function logging({
  type = "log", 
  title = DrApi.info.shortName, 
  input = undefined, 
  color = "red"
}) {
  console[type](`%c[${title}]%c`, `font-weight: bold; color: ${color}`, "", (typeof input === "object") ? [...input][0] : input)
}
function log(title, ...logs) {
  logging({
    type: "log", 
    title: title, 
    input: logs
  })
}
function warn(title, ...warns) {
  logging({
    type: "warn", 
    title: title, 
    input: warns
  })
}
function error(title, ...errors) {
  logging({
    type: "error", 
    title: title, 
    input: errors
  })
}

export { log, warn, error }