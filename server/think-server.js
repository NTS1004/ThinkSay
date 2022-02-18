const koa = require("koa")
const http = require("http")
const router = require("koa-router")
const webSocket = require("ws")
const bodyparser = require("koa-bodyparser")
const moment = require("moment")
const config = require("./configs")
const wsServer = require("./configs/ws")
const db = require("./configs/db")
const push = require("./configs/push")
const Global = require("./utils/global")
const axios = require("./utils/axios")
const echo = require("./utils/echo")
const jwt = require("jsonwebtoken")

const app = new koa()

global = Object.assign(global, Global)
global.axios = axios
global.push = push

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*")
  await next()
})

app.use(async (ctx, next) => {
  const { url, header } = ctx.request
  const token = header?.["auth-token"]
  if (url.includes("/auth/login") || url.includes("/auth/register")) {
    await next()
  } else if (!token) {
    ctx.body = echo("error", {
      content: "你没有资格访问(ˉ▽￣～) 切~~"
    })
  } else {
    const { id } = await jwt.verify(token, global.secret)
    if (id) {
      await next()
    } else {
      ctx.body = echo("error", {
        content: "你没有资格访问(ˉ▽￣～) 切~~"
      })
    }
  }
})

app.use(bodyparser())

app.use(async (ctx, next) => {
  ctx.db = db
  ctx.echo = echo
  ctx.moment = moment
  await next()
})

const server = http.createServer(app.callback())
const wss = new webSocket.Server({
  server
})

const routers = new router()
app.use(routers.routes())
routers.use("/", require("./configs/routers"))

wsServer(wss, global)

server.listen(config.port)
