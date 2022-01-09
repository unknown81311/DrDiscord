const { createServer, request } = require("http")
const { parse } = require("url")
const { readFile } = require("fs")
const { join } = require("path")

const server = createServer(function (req, res) {
  const { pathname } = parse(req.url, true);
  const filename = join(__dirname, "..", pathname)
  readFile(filename, function(err, data) {
    if (err) {
      res.writeHead(404, {
        "Content-Type": "text/html"
      })
      return res.end("404 Not Found")
    }
    res.write(data)
    return res.end()
  })
})

let didStart = [false, "http://localhost:7390/"]

function start() {
  for (const num of [7390, 7391, 7392, 7393, 7394, 7395]) {
    try {
      if (didStart[0]) return
      server.listen(num)
      didStart = [true, `http://localhost:${num}/`]
      console.log(`LocalHost is "${didStart[1]}`)
    } 
    catch (error) {}
  }
}
start()

module.exports = didStart[1]