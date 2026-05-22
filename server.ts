import { createServer } from "https"
import { parse } from "url"
import next from "next"
import fs from "fs"
import path from "path"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

const httpsOptions = {
  key: fs.readFileSync(path.join(process.cwd(), "localhost-key.pem")),
  cert: fs.readFileSync(path.join(process.cwd(), "localhost.pem")),
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  }).listen(process.env.PORT, () => {
    console.log(`🚀 Frontend running at https://localhost:${process.env.PORT}`)
  })
})
