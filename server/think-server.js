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

const app = new koa()

app.use(async (ctx, next) => {
  // if(ctx.request.headers['origin'] && Url.parse(ctx.request.headers['origin']).hostname == "cjh1004.vip"){

  //   }
  ctx.set("Access-Control-Allow-Origin", "*")
  await next()
})

global = Object.assign(global, Global)
global.axios = axios
global.push = push

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
