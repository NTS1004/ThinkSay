const koa = require("koa")
const http = require("http")
// const ssl = require("koa-sslify").default
const router = require("koa-router")
const webSocket = require("ws")
const bodyparser = require("koa-bodyparser")
const jwt = require("jsonwebtoken")
const moment = require("moment")
// const fs = require("fs")
const config = require("./configs")
const wsServer = require("./configs/ws")
const db = require("./configs/db")
const push = require("./configs/push")
const Global = require("./utils/global")
const axios = require("./utils/axios")
const echo = require("./utils/echo")

const app = new koa()

global = Object.assign(global, Global)
global.axios = axios
global.push = push

// app.use(ssl())

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*")
  await next()
})

app.use(async (ctx, next) => {
  try {
    const { url, header } = ctx.request
    const token = header?.["auth-token"]
    const skip_verify = url.includes("/auth/login") || url.includes("/auth/register")
    if (!skip_verify) {
      const { id } = await jwt.verify(token, global.secret)
      if (!id) throw "error"
    }
  } catch {
    ctx.body = echo("error", {
      content: "你没有资格访问(ˉ▽￣～) 切~~"
    })
  }
  await next()
})

app.use(bodyparser())

app.use(async (ctx, next) => {
  ctx.db = db
  ctx.echo = echo
  ctx.moment = moment
  await next()
})

// const options = {
//   key: fs.readFileSync("./ssl/2_cjh1004.vip.key"),
//   cert: fs.readFileSync("./ssl/1_cjh1004.vip_bundle.crt")
// }

// const server = https.createServer(options, app.callback()).listen(config.port)
const server = http.createServer(app.callback()).listen(config.port)

const wss = new webSocket.Server({
  server
})

const routers = new router()
app.use(routers.routes())
routers.use("/", require("./configs/routers"))

wsServer(wss, global)
