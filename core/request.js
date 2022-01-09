// Modification from OpenAsar's request polyfill to support http
// Original license: MIT License (c) GooseMod
// https://github.com/GooseMod/OpenAsar/blob/main/LICENSE

const querystring = require("querystring")
const proto = {
  https: require("https"),
  http: require("http")
}

function requ(type, resolve, { method, url, headers, qs, timeout, body, stream }) {
  const fullUrl = `${url}${qs != null ? `?${querystring.stringify(qs)}` : ""}`
  return proto[type].request(fullUrl, {
    method, headers, timeout
  }, async (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      return resolve(await nodeReq({
        url: res.headers.location, qs: null, method, headers, timeout, body, stream
      }))
    }

    resolve(res)
  })
}

const nodeReq = ({ method, url, headers, qs, timeout, body, stream }) => {
  return new Promise((resolve) => {
    let req
    let args = [resolve, { method, url, headers, qs, timeout, body, stream }]
    try { req = requ("https", ...args) }
    catch (e) {
      try { req = requ("http", ...args) }
      catch (e) {  return resolve(e) }
    }
    req.on("error", resolve)
    if (body) req.write(body)
    req.end()
  })
}

const request = (...args) => {
  let options, callback
  switch (args.length) {
    case 3:
      options = { url: args[0], ...args[1] }
      callback = args[2]
      break

    default:
      options = args[0]
      callback = args[1]
  }

  if (typeof options === "string") options = { url: options }

  const listeners = {}

  nodeReq(options).then(async (res) => {
    const isError = !res.statusCode

    if (isError) {
      listeners["error"]?.(res)
      callback?.(res, null, null)
      return
    }
    listeners["response"]?.(res)
    let body = ""
    res.on("data", (chunk) => {
      body += chunk
      listeners["data"]?.(chunk)
    })
    await new Promise((resolve) => res.on("end", resolve))

    callback?.(undefined, res, body)
  })

  const ret = {
    on: (type, handler) => {
      listeners[type] = handler
      return ret
    }
  }
  return ret
}

Object.assign(request, {
  get: (url, callback) => request({ url: url, method: "GET" }, callback),
  post: (url, callback) => request({ url: url, method: "POST" }, callback),
  patch: (url, callback) => request({ url: url, method: "PATCH" }, callback),
  delete: (url, callback) => request({ url: url, method: "DELETE" }, callback),
  head: (url, callback) => request({ url: url, method: "HEAD" }, callback),
  options: (url, callback) => request({ url: url, method: "OPTIONS" }, callback)
})

module.exports = request